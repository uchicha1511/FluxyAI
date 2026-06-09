import IAIRepository from "../contracts/IAIRepository.js";
import { ChatMistralAI } from "@langchain/mistralai";
import { StateGraph, START, END, Annotation, messagesStateReducer } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MISTRAL_API_KEY } from "../../config/environment.js";
import { tavilyTool } from "../../agent/Tools/Tavily.tool.js";

const GraphState = Annotation.Root({
  message: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  response: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),
});

class MistralRepository extends IAIRepository {
  constructor() {
    super();

    // Tool-enabled model
    this.model = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.7,
    }).bindTools([tavilyTool]);

    // Title model
    this.titleModel = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.3,
    });

    this.graph = this._buildGraph();
  }

  // Graph Construction
  _buildGraph() {
    const graph = new StateGraph(GraphState);

    // Chat Node
    graph.addNode("chatNode", async (state) => {
      const messages =
        state.messages.length > 0
          ? state.messages
          : [
              new SystemMessage(
                `You are a helpful AI assistant. Today's date is ${new Date().toLocaleDateString("en-US")}. ` +
                `You have access to a web search tool. Use it whenever the user asks about current events, today's date/time, recent news, real-time data, or anything that may require up-to-date information.`
              ),
              new HumanMessage(state.message),
            ];

      const stream = await this.model.stream(messages);

      let aiMessage = null;
      for await (const chunk of stream) {
        aiMessage = aiMessage ? aiMessage.concat(chunk) : chunk;
      }

      const fullResponse = aiMessage.content || "";

      return {
        response: fullResponse,
        messages: [aiMessage],
      };
    });

    // Tool Node
    const toolNode = new ToolNode([tavilyTool]);
    graph.addNode("tools", toolNode);

    // Flow Start
    graph.addEdge(START, "chatNode");

    // Routing Logic
    graph.addConditionalEdges("chatNode", (state) => {
      const lastMessage = state.messages?.at(-1);

      if (lastMessage?.tool_calls?.length > 0) {
        return "tools";
      }

      return END;
    });

    graph.addEdge("tools", "chatNode");

    return graph.compile();
  }


  //Response Streaming

  async streamResponse(message, onChunk) {
    const eventStream = this.graph.streamEvents(
      { message },
      {
        version: "v2",
        streamMode: "values",
      }
    );

    for await (const event of eventStream) {
      if (
        event.event === "on_chat_model_stream" &&
        event.data?.chunk?.content
      ) {
        onChunk(event.data.chunk.content);
      }
    }
  }

  // Generate Title

  async createTitle(message) {
    const prompt = [
      {
        role: "system",
        content:
          "You generate very short chat titles (3–6 words only, no punctuation).",
      },
      {
        role: "user",
        content: `Generate a title for: ${message}`,
      },
    ];

    const response = await this.titleModel.invoke(prompt);
    return response.content?.trim() || "Untitled Chat";
  }
}

export default MistralRepository;