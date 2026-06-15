import IAIRepository from "../contracts/IAIRepository.js";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { MISTRAL_API_KEY, GEMINI_API_KEY } from "../../config/environment.js";

// ─── State Schema ────────────────────────────────────────────────────────────
// Annotation.Root defines the typed state that flows through the graph.
const GraphState = Annotation.Root({
  // The raw user message string sent into the graph
  message: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),
  // Which provider to route to: "mistral" or "gemini"
  provider: Annotation({
    reducer: (_, next) => next,
    default: () => "mistral",
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

    // Primary chat model for Mistral
    this.model = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.7,
    });

    // Separate model instance for title generation
    this.titleModel = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.3,
    });

    // Primary chat model for Gemini
    this.geminiModel = new ChatGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });

    // Compile the graph once; reuse across requests
    this.graph = this._buildGraph();
  }

  // ─── Graph Construction ────────────────────────────────────────────────────

  _buildGraph() {
    const graph = new StateGraph(GraphState);

    /**
     * chatNode: streams tokens from Mistral and accumulates the full text.
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

    /**
     * geminiNode: streams tokens from Gemini and accumulates the full text.
     */
    graph.addNode("geminiNode", async (state) => {
      const stream = await this.geminiModel.stream([
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

    // Router edge decision maker
    const routeModel = (state) => {
      if (state.provider === "gemini") {
        return "geminiNode";
      }
      return "chatNode";
    };

    // Set up routing
    graph.addConditionalEdges(START, routeModel, {
      chatNode: "chatNode",
      geminiNode: "geminiNode",
    });

    graph.addEdge("chatNode", END);
    graph.addEdge("geminiNode", END);

    return graph.compile();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * streamResponse — drives graph execution via streamEvents() and
   * forwards every streaming token to the provided `onChunk` callback.
   *
   * @param {string}   message  - The user's message text
   * @param {string}   provider - The selected AI provider ("mistral" or "gemini")
   * @param {Function} onChunk  - Called with each token string as it arrives
   */
  async streamResponse(message, provider, onChunk) {
    let actualOnChunk = onChunk;
    let selectedProvider = provider || "mistral";
    if (typeof provider === "function") {
      actualOnChunk = provider;
      selectedProvider = "mistral";
    }

    const eventStream = this.graph.streamEvents(
      { message, provider: selectedProvider },
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
        if (actualOnChunk) actualOnChunk(event.data.chunk.content);
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
          "You are a helpful assistant that generates very short, concise chat titles (3 to 6 words). " +
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
