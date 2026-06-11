import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

export const emailQueue = new Queue("email", {
  connection,
});

export async function addEmailJob(jobName, data) {
  return await emailQueue.add(jobName, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  });
}
