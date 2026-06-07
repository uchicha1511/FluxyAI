import IMessageRepository from "../contracts/IMessageRepository.js";
import Message from "../../models/message.model.js";

class MongoMessageRepository extends IMessageRepository {
  async createMessage(messageData) {
    return await Message.create(messageData);
  }


  async getAllMessages({ chatId }) {
    return await Message.find({ chat: chatId }).sort({ timestamp: 1 });
  }


}

export default MongoMessageRepository;
