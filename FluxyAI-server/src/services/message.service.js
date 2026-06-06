import mongoMessageRepository from "../repositories/implementations/mongoMessageRepository.js";
import { AppError } from "../utils/errors.js";

class messageService {
  constructor() {
    this.messageRepository = new mongoMessageRepository();
  }

  async getAllMessages({ chatId }) {
    return await this.messageRepository.getAllMessages({ chatId });
  }
}

export default messageService;
