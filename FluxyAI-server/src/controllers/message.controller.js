import ChatService from "../services/chat.service.js";
import MessageService from "../services/message.service.js";

class MessageController {
  constructor() {
    this.messageService = new MessageService();
    this.chatService = new ChatService();
  }

  streamMessages = async (req, res, next) => {
    let sseStarted = false;

    try {
      const { message, provider = "mistral" } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      // ── SSE headers ───────────────────────────────────────────────────────
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      sseStarted = true;

      // Create (or look up) the chat record and generate its title first
      const title = await this.messageService.createTitle(message);
      const chat = await this.chatService.createChat({
        userId: req.user.id,
        title,
      });

      // Stream tokens through: graph.streamEvents → chatNode/geminiNode → model.stream
      await this.messageService.streamMessages(
        { chatId: chat._id, message, provider },
        (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          if (typeof res.flush === "function") res.flush();
        },
      );

      // Signal the client that the stream is complete
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      // ── Error Handling ────────────────────────────────────────────────────
      // Detect specific error types and return human-readable messages
      let errorMessage = "An unexpected error occurred.";
      let errorCode = "INTERNAL_ERROR";

      if (error.message?.includes("RATE_LIMIT") || error.message?.includes("rate limit") || error.statusCode === 429) {
        errorCode = "RATE_LIMIT";
        errorMessage = "AI provider rate limit exceeded. Please wait a moment and try again.";
      } else if (error.message?.includes("API key") || error.statusCode === 401) {
        errorCode = "INVALID_API_KEY";
        errorMessage = "AI provider API key is invalid or expired.";
      } else if (error.message?.includes("MODEL_RATE_LIMIT")) {
        errorCode = "MODEL_RATE_LIMIT";
        errorMessage = "OpenAI quota exceeded. Please add credits at platform.openai.com or switch to Mistral.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error(`[MessageController] Error: ${errorCode} - ${errorMessage}`);

      if (sseStarted) {
        // SSE already started — send error as an SSE event before closing
        res.write(`event: error\ndata: ${JSON.stringify({ success: false, code: errorCode, message: errorMessage })}\n\n`);
        res.end();
      } else {
        // SSE not started yet — send normal JSON error response
        next(error);
      }
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
