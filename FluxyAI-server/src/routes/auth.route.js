import express from "express";
import authController from "../controllers/auth.controller.js";
import { registerValidator } from "../middlewares/validators/auth.validator.js";

const router = express.Router();

router.post("/register", registerValidator, authController.register);

export default router;
