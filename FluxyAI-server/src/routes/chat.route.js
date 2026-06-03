import express from "express";
import chatController from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", chatController.createChat);

router.delete("/:chatId", chatController.deleteChat);

export default router;