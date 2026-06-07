class IMessageRepository {
  async createMessage({ messageData }) {
    throw new Error("Method not implemented.");
  }

  async getAllMessages({ chatId }) {
    throw new Error("Method not implemented.");
  }
}

export default IMessageRepository;
