import mongoMessageRepository from "../repositories/implementations/mongoMessageRepository.js";
import MistralRepository from "../repositories/implementations/MistralRepository.js";

class messageService {
  constructor() {
    this.messageRepository = new mongoMessageRepository();
    this.aiRepository = new MistralRepository();
  }

async streamMessages({ chatId, message }, onChunk) {
  await this.messageRepository.createMessage({
    chat: chatId,
    sender: "user",
    content: message,
  });

  let fullResponse = "";

  await this.aiRepository.streamResponse(
    message,
    (chunk) => {
      fullResponse += chunk;
      onChunk(chunk);
    }
  );

  await this.messageRepository.createMessage({
    chat: chatId,
    sender: "agent",
    content: fullResponse,
  });
}

  async createTitle(message) {
    return await this.aiRepository.createTitle(message);
  }

  async getAllMessages({ chatId }) {
    return await this.messageRepository.getAllMessages({ chatId });
  }
}

export default messageService;
