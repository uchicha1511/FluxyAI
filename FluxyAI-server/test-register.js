import connectDB from "./src/config/database.js";
import AuthService from "./src/services/auth.service.js";
import mongoose from "mongoose";

// Import worker to make sure it's running
import "./src/workers/email.worker.js";

async function test() {
  try {
    await connectDB();
    console.log("DB connected.");

    const authService = new AuthService();

    // Clean up test user if exists
    const email = "devan.nahariya@gmail.com";
    await mongoose.connection.collection("users").deleteOne({ email });
    console.log("Cleaned up old test user.");

    console.log("Registering user...");
    const res = await authService.register({
      username: "DevanTest",
      email: email,
      password: "password123"
    });
    console.log("Registration response:", res);

    // Wait for the worker to process the job
    console.log("Waiting 10 seconds for worker to process...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log("Done waiting.");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error in registration test:", err);
    process.exit(1);
  }
}

test();
