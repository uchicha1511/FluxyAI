import { REDIS_HOST, REDIS_PORT, REDIS_URL } from "./environment.js";

let connectionOptions = {};

if (REDIS_URL) {
  try {
    const parsedUrl = new URL(REDIS_URL);
    connectionOptions = {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port || "6379", 10),
      maxRetriesPerRequest: null,
    };

    if (parsedUrl.username) {
      connectionOptions.username = decodeURIComponent(parsedUrl.username);
    }
    if (parsedUrl.password) {
      connectionOptions.password = decodeURIComponent(parsedUrl.password);
    }
    
    const dbPath = parsedUrl.pathname.substring(1);
    if (dbPath) {
      connectionOptions.db = parseInt(dbPath, 10) || 0;
    }

    if (parsedUrl.protocol === "rediss:") {
      connectionOptions.tls = {};
    }
  } catch (error) {
    console.error("Failed to parse REDIS_URL, falling back to host/port:", error);
    connectionOptions = {
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: null,
    };
  }
} else {
  connectionOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
  };
}

export const connection = connectionOptions;
