import dotenv from "dotenv/config";

const Secrets = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "MISTRAL_API_KEY",
    "REDIS_URL",
    "BREVO_API_KEY",
    "TAVILY_API_KEY",
    "SENDER_EMAIL"
]

const missing = Secrets.filter((secret) => {
    return !process.env[secret];
})

if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}


export const { PORT, MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, MISTRAL_API_KEY, TAVILY_API_KEY, BREVO_API_KEY, SENDER_EMAIL } = process.env;

export const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
export const REDIS_URL = process.env.REDIS_URL || "";
export const APP_URL = process.env.APP_URL || `http://localhost:${PORT || 5000}`;