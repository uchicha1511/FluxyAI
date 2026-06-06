import MessageService from "../services/message.service.js";

class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  getMessages = async (req, res, next) => {
    try {
      const result = await this.messageService.getAllMessages({ chatId: req.params.chatId });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default new MessageController();