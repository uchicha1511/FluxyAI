import express from "express";
import authController from "../controllers/auth.controller.js";
import {
  loginValidator,
  registerValidator,
} from "../middlewares/validators/auth.validator.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerValidator, authController.register);
router.get("/verify", authController.verifyEmail);
router.post("/login", loginValidator, authController.login);
router.post("/logout", authenticateJWT, authController.logout);
router.post("/refresh", authController.refreshToken);

export default router;
