import chatService from "../services/chat.service.js";

class ChatController {
  constructor() {
    this.chatService = new chatService();
  }

  createChat = async (req, res, next) => {
    try {
      const result = await this.chatService.createChat(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new ChatController();
