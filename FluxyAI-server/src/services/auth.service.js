import jwt from "jsonwebtoken";
import MongoUserRepository from "../repositories/implementations/mongoUserRepository.js";
import { AppError } from "../utils/errors.js";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../config/environment.js";

class AuthService {
  constructor() {
    this.userRepository = new MongoUserRepository();
  }

  async register(userData) {
    const existingUser = await this.userRepository.findUserByEmail(
      userData.email,
    );

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const user = await this.userRepository.createUser(userData);

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(userData) {
    const { email, password } = userData;

    const user = await this.userRepository.findUserByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  }

  refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);

      const accessToken = jwt.sign(
        {
          id: decoded.id,
        },
        JWT_SECRET,
        {
          expiresIn: "15m",
        },
      );

      return { accessToken };
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401, [error]);
    }
  }
}

export default AuthService;
