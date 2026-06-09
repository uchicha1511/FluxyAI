import "dotenv/config";

const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "MISTRAL_API_KEY",
  "TAVILY_API_KEY",
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Server Error: Missing required environment variables: ${missing.join(", ")}`,
  );
}

export const {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  MISTRAL_API_KEY,
  TAVILY_API_KEY,
} = process.env;
