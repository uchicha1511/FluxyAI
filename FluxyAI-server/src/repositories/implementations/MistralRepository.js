import IAIRepository from "../contracts/IAIRepository.js";
import { ChatMistralAI } from "@langchain/mistralai";
import { StateGraph, START, END } from "@langchain/langgraph";
import { MISTRAL_API_KEY } from "../../config/environment.js";
import { createAgent, toolStrategy } from "langchain"
import z from "zod"

class MistralRepository extends IAIRepository {
  constructor() {
    super();

    this.model = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.7,
    });

    this.titleModel = new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.7,
    });

    this.graph = this.createGraph();
    this.generateTitle = this.createTitle();
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

  async createTitle(message) {
    const titleAgent = createAgent({
        model: this.titleModel,
        tools: [],
        responseFormat: toolStrategy(z.object({
            chatTitle: z.string().describe("A concise title for the given message")
        }))
    })

    const response = await titleAgent.invoke({
        messages: [
            {
                role: "user",
                content: `Generate a concise title for the following message: ${message}`
            }
        ],
    })

    return response.structuredResponse?.chatTitle || "Untitled";
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
