import jwt from "jsonwebtoken";
import MongoUserRepository from "../repositories/implementations/mongoUserRepository.js";
import { AppError } from "../utils/errors.js";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../config/environment.js";
import { addEmailJob } from "../queues/email.queue.js";

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

    const verificationToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    await addEmailJob("sendVerificationEmail", {
      email: user.email,
      username: user.username,
      token: verificationToken,
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      message: "Registration successful. Please verify your email to log in."
    };
  }

  async login(userData) {
    const { email, password } = userData;

    const user = await this.userRepository.findUserByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    if (!user.isVerified) {
      throw new AppError("Please verify your email address to log in", 403);
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
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

  async verifyEmail(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await this.userRepository.findUserById(decoded.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (user.isVerified) {
        return { message: "Email is already verified" };
      }

      await this.userRepository.updateUser(user._id, { isVerified: true });
      return { message: "Email verified successfully" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Invalid or expired verification token", 400, [error]);
    }
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
