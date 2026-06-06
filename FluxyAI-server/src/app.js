import express from "express";
import authRoutes from "./routes/auth.route.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use(errorHandler);

export default app;