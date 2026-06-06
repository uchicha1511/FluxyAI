import IAIRepository from "../contracts/IAIRepository.js";
import { ChatMistralAI } from "@langchain/mistralai";
import { StateGraph, START, END } from "@langchain/langgraph";
import { MISTRAL_API_KEY } from "../../config/environment.js";

class MistralRepository extends IAIRepository {
  constructor() {
    super();

    this.model = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.7,
    });

    this.graph = this.createGraph();
  }

  createGraph() {
    const graph = new StateGraph({
      channels: {
        message: null,
        response: null,
      },
    });

    graph.addNode("chatNode", async (state) => {
      const response = await this.model.invoke(state.message);

      return {
        response: response.content,
      };
    });

    graph.addEdge(START, "chatNode");
    graph.addEdge("chatNode", END);

    return graph.compile();
  }

  async streamResponse(message, onChunk) {
    const result = await this.graph.invoke({
      message,
    });

    const response = result.response || "";

    // Fake streaming through SSE chunks
    for (const char of response) {
      onChunk(char);
    }
  }
}

export default MistralRepository;
