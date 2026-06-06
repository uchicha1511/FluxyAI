import mongoMessageRepository from "../repositories/implementations/mongoMessageRepository.js";
import MistralRepository from "../repositories/implementations/MistralRepository.js";

class messageService {
  constructor() {
    this.messageRepository = new mongoMessageRepository();
    this.aiRepository = new MistralRepository();
  }

  async streamMessages(message, onChunk) {
    return await this.aiRepository.streamResponse(message, onChunk);
  }

  async getAllMessages({ chatId }) {
    return await this.messageRepository.getAllMessages({ chatId });
  }
}

export default messageService;
