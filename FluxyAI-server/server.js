import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { PORT } from "./src/config/environment.js";
import "./src/workers/email.worker.js";

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server!", error);
        process.exit(1);
    }
}

startServer();