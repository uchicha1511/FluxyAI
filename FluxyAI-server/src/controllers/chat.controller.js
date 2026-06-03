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

}

export default new ChatController();
