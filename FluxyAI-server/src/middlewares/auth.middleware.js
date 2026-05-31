import AuthService from "../services/auth.service.js";
import { AppError } from "../utils/errors.js";

const authService = new AuthService();

export const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new AppError("Unauthorized", 401, [
        "Token missing for accessing this resource",
      ]);
    }

    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};