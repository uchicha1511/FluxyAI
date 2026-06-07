import ChatService from "../services/chat.service.js";
import MessageService from "../services/message.service.js";

class MessageController {
  constructor() {
    this.messageService = new MessageService();
    this.chatService = new ChatService();
  }

  streamMessages = async (req, res, next) => {
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

      const title = await this.messageService.createTitle(message);
      const chat = await this.chatService.createChat({
        userId: req.user.id,
        title,
      });

      await this.messageService.streamMessages(
        {
          chatId: chat._id,
          message,
        },
        (chunk) => {
          res.write(`data: ${chunk}\n\n`);
        }
      );

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req, res, next) => {
    try {
      const result = await this.messageService.getAllMessages({
        chatId: req.params.chatId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default new MessageController();
