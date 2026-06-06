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

  streamChat = async (req, res, next) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      await this.chatService.streamChat(message, (chunk) => {
        res.write(`data: ${chunk}\n\n`);
      });

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      next(error);
    }
  };
}

export default new ChatController();
