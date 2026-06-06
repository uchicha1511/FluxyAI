import chatService from "../services/chat.service.js";

class ChatController {
  constructor() {
    this.chatService = new chatService();
  }

  createChat = async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const { title = "Untitled" } = req.body;
      const chatData = { title, userId };

      const result = await this.chatService.createChat(chatData);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteChat = async (req, res, next) => {
    try {
      const { chatId } = req.params;

      const result = await this.chatService.deleteChat(chatId);

      res.status(200).json({
        success: true,
        data: result,
        message: "Chat deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getAllChats = async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const result = await this.chatService.getAllChats({ userId });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
  
}

export default new ChatController();
