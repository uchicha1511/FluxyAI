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

  async updateUser(id, updateData) {
    return await userModel.findByIdAndUpdate(id, updateData, { new: true });
  }
}

export default MongoUserRepository;
