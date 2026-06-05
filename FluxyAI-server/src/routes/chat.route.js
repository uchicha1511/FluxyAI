import express from "express";
import chatController from "../controllers/chat.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateJWT);

router.post("/create", chatController.createChat);

router.post("/message", chatController.streamChat);

router.delete("/:chatId", chatController.deleteChat);

router.get("/", chatController.getAllChats);

export default router;