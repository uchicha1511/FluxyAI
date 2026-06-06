import express from "express";
import messageController from "../controllers/message.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.use(authenticateJWT);

router.post("/", messageController.streamMessages);
router.get("/:chatId", messageController.getMessages);

export default router;