import mongoChatRepository from "../repositories/implementations/mongoChatRepository.js";
import { AppError } from "../utils/errors.js";

class chatService {
  constructor() {
    this.chatRepository = new mongoChatRepository();
  }

  async createChat(chatData) {
    return await this.chatRepository.createChat(chatData);
  }

  async deleteChat(chatId) {
    const chat = await this.chatRepository.deleteChat(chatId);

    if (!chat) {
      throw new AppError("Chat not found", 404);
    }

    return chat;
  }

  async getAllChats({userId}){
    return await this.chatRepository.getAllChats({userId});
  }
}

export default chatService;
