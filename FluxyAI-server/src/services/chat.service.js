import mongoChatRepository from "../repositories/implementations/mongoChatRepository.js";

class chatService {
  constructor() {
    this.chatRepository = new mongoChatRepository();
  }

  async createChat(chatData) {
    return await this.chatRepository.createChat(chatData);
  }

  async deleteChat(Chatid) {
    return await this.chatRepository.deleteChat(Chatid);
  }
}

export default chatService;