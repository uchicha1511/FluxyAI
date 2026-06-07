import IAIRepository from "../contracts/IAIRepository.js";
import { ChatMistralAI } from "@langchain/mistralai";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { MISTRAL_API_KEY } from "../../config/environment.js";

// ─── State Schema ────────────────────────────────────────────────────────────
// Annotation.Root defines the typed state that flows through the graph.
const GraphState = Annotation.Root({
  // The raw user message string sent into the graph
  message: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),
  // Accumulated AI response (populated after the node finishes)
  response: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),
});

class MistralRepository extends IAIRepository {
  constructor() {
    super();

    // Primary chat model — streaming enabled by default in LangChain
    this.model = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.7,
    });

    // Separate model instance for title generation
    this.titleModel = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.3, // lower temp → more deterministic titles
    });

    // Compile the graph once; reuse across requests
    this.graph = this._buildGraph();
  }

  // ─── Graph Construction ────────────────────────────────────────────────────

  _buildGraph() {
    const graph = new StateGraph(GraphState);

    /**
     * chatNode: streams tokens from Mistral and accumulates the full text.
     *
     * NOTE: model.stream() is called here so that LangGraph's streamEvents()
     * can surface the individual token chunks as "on_chat_model_stream" events.
     * The node still returns the complete response so the graph state is valid.
     */
    graph.addNode("chatNode", async (state) => {
      const stream = await this.model.stream([
        { role: "user", content: state.message },
      ]);

      let fullResponse = "";
      for await (const chunk of stream) {
        if (chunk.content) {
          fullResponse += chunk.content;
        }
      }

      return { response: fullResponse };
    });

    graph.addEdge(START, "chatNode");
    graph.addEdge("chatNode", END);

    return graph.compile();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * streamResponse — drives graph execution via streamEvents() and
   * forwards every streaming token to the provided `onChunk` callback.
   *
   * @param {string}   message  - The user's message text
   * @param {Function} onChunk  - Called with each token string as it arrives
   */
  async streamResponse(message, onChunk) {
    const eventStream = this.graph.streamEvents(
      { message },
      {
        version: "v2",       // streamEvents API version (v2 is stable in LangGraph 1.x)
        streamMode: "values", // emit full state snapshots; tokens come via events
      }
    );

    for await (const event of eventStream) {
      /**
       * "on_chat_model_stream" fires for every token the LLM emits.
       * The chunk lives at event.data.chunk — a standard AIMessageChunk.
       */
      if (
        event.event === "on_chat_model_stream" &&
        event.data?.chunk?.content
      ) {
        onChunk(event.data.chunk.content);
      }
    }
  }

  /**
   * createTitle — generates a short chat title for the first user message.
   * Uses a direct model.invoke() call (no graph needed for this utility).
   *
   * @param  {string} message - The user's first message
   * @returns {Promise<string>} A concise title string
   */
  async createTitle(message) {
    const prompt = [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates very short, concise chat titles (3–6 words). " +
          "Reply with ONLY the title text, no punctuation, no quotes.",
      },
      {
        role: "user",
        content: `Generate a title for this message: ${message}`,
      },
    ];

    const response = await this.titleModel.invoke(prompt);
    return response.content?.trim() || "Untitled Chat";
  }
}

export default MistralRepository;
