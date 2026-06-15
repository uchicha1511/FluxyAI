import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import mailService from "../services/mail.service.js";

const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log(`[Worker] Processing job ${job.id} of name ${job.name}`);
    if (job.name === "sendVerificationEmail") {
      const { email, username, token } = job.data;
      await mailService.sendVerificationEmail(email, username, token);
    }
  },
  {
    connection,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});

export default emailWorker;