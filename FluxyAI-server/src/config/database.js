import mongoose from "mongoose";
import { MONGO_URI } from "./environment.js";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {});
        console.log("Mongo DB connected successfully!");
    } catch (error) {
        console.error("Mongo DB connection failed!", error);
        process.exit(1);
    }
}

export default connectDB;