import MongoMessageRepository from "../repositories/implementations/mongoMessageRepository.js";
import MistralRepository from "../repositories/implementations/MistralRepository.js";

class MessageService {
  constructor() {
    this.messageRepository = new MongoMessageRepository();
    this.aiRepository = new MistralRepository();
  }

  /**
   * Saves the user message, streams the AI response token-by-token via
   * LangGraph's graph.streamEvents(), then persists the complete AI message.
   *
   * Flow:
   *   Controller → streamMessages() → aiRepository.streamResponse()
   *   → graph.streamEvents() → chatNode/geminiNode → model.stream() → onChunk (SSE)
   *
   * @param {{ chatId: string, message: string, provider?: string }} params
   * @param {(chunk: string) => void} onChunk  - SSE token callback
   */
  async streamMessages({ chatId, message, provider }, onChunk) {
    // 1. Persist the user message before generation starts
    await this.messageRepository.createMessage({
      chat: chatId,
      sender: "user",
      content: message,
    });

    let fullResponse = "";

    try {
      // 2. Drive LangGraph execution; onChunk fires for every token
      await this.aiRepository.streamResponse(message, provider, (chunk) => {
        fullResponse += chunk;
        onChunk(chunk);
      });
    } finally {
      // 3. Always persist the AI message, even if streaming was interrupted
      if (fullResponse) {
        await this.messageRepository.createMessage({
          chat: chatId,
          sender: "agent",
          content: fullResponse,
        });
      }
    }
  }

  /**
   * Generates a concise title for the first user message in a chat.
   * Delegated to the AI repository (direct model.invoke(), no graph).
   */
  async createTitle(message) {
    return await this.aiRepository.createTitle(message);
  }

  async getAllMessages({ chatId }) {
    return await this.messageRepository.getAllMessages({ chatId });
  }
}

export default MessageService;
