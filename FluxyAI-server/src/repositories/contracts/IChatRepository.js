class IChatRepository {
    async createChat(chatData){
        throw new Error("Method not implemented.");
    }

    async findChatById(id) {
        throw new Error("Method not implemented.");
    }

    async deleteChat(id) {
        throw new Error("Method not implemented.");
    }

    async getAllChats({userId}){
        throw new Error("Method not implemented.");
    }
}

export default IChatRepository;