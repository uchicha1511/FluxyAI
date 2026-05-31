import jwt from "jsonwebtoken";
import MongoUserRepository from "../repositories/implementations/mongoUserRepository.js";
import { AppError } from "../utils/appError.js";

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
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }
}

export default AuthService;
