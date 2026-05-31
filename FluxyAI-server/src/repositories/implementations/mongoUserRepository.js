import IuserRepository from "../contracts/IUserRepository.js";
import userModel from "../../models/user.model.js";

class MongoUserRepository extends IuserRepository {
  async createUser(userData) {
    return await userModel.create(userData);
  }

  async findUserByEmail(email) {
    return await userModel.findOne({ email });
  }

  async findUserById(id) {
    return await userModel.findById(id);
  }
}

export default MongoUserRepository;
