import dotenv from "dotenv/config";

const Secrets = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET"
]

const missing = Secrets.filter((secret) => {
    return !process.env[secret];
})

if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}


export const { PORT, MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET } = process.env;