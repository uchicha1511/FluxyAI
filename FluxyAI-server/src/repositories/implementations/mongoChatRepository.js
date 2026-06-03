import IChatRepository  from "../contracts/IChatRepository.js";
import Chat from "../../models/chat.model.js";

class MongoChatRepository extends IChatRepository {
    async createChat(chatData) {
        return await Chat.create(chatData);
    }

    async findChatById(id) {
        return await Chat.findById(id);
    }

    async deleteChat(id) {
        return await Chat.findByIdAndDelete(id);
    }
}

export default MongoChatRepository;