import IChatRepository from "../contracts/IChatRepository.js";
import Chat from "../../models/chat.model.js";

class MongoChatRepository extends IChatRepository {
  async createChat({ userId, title }) {
    return await Chat.create({ userId, title });
  }

  async getAllChats({userId}){
    return await Chat.find({userId}).sort({createdAt: -1});
  }

  async findChatById(id) {
    return await Chat.findById(id);
  }

  async deleteChat(id) {
    console.log("Repository ID:", id);

    const chat = await Chat.findByIdAndDelete(id);

    console.log("Repository Result:", chat);

    return chat;
  }
}

export default MongoChatRepository;
