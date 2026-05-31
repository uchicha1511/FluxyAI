import express from "express";
import authController from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../middlewares/validators/auth.validator.js";

const router = express.Router();

router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);

export default router;
