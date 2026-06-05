import AuthService from "../services/auth.service.js";
import { AppError } from "../utils/errors.js";

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  get cookieOptions() {
    const isProd = process.env.NODE_ENV === "production";
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    };
  }

  register = async (req, res, next) => {
    try {
      const result = await this.authService.register(req.body);

      res.cookie("accessToken", result.accessToken, {
        ...this.cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", result.refreshToken, {
        ...this.cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      delete result.refreshToken;

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body);

      res.cookie("accessToken", result.accessToken, {
        ...this.cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", result.refreshToken, {
        ...this.cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      delete result.refreshToken;

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const accessToken = req.cookies?.accessToken;
      const refreshToken = req.cookies?.refreshToken;

      if (accessToken) {
        this.authService.verifyAccessToken(accessToken);
      }

      if (refreshToken) {
        this.authService.verifyRefreshToken(refreshToken);
      }

      res.clearCookie("accessToken", this.cookieOptions);
      res.clearCookie("refreshToken", this.cookieOptions);

      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new AppError("Refresh token not found", 401);
      }

      const result = this.authService.refreshAccessToken(refreshToken);

      res.cookie("accessToken", result.accessToken, {
        ...this.cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  };
  
}

export default new AuthController();
