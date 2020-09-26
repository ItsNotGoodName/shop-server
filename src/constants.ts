import { config } from "dotenv";

// Use '.env' file only if in development
if (process.env.NODE_ENV !== "production") {
  config();
}

export const PRODUCTION = process.env.NODE_ENV === "production";

export const ORIGIN = process.env.ORIGIN || "http://localhost:3000";
export const PORT = process.env.PORT || 4000;

export const DB_TYPE = process.env.DB_TYPE || "postgres";
export const DB_DATABASE = process.env.DB_DATABASE || "test_database";
export const DB_USERNAME = process.env.DB_USERNAME || "postgres";
export const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
export const DB_HOST = process.env.DB_HOST || "localhost";

export const REDIS_HOST = process.env.REDIS_HOST || "localhost";
export const COOKIE_NAME = process.env.COOKIE_NAME || "cookie_name";
export const COOKIE_AGE = process.env.COOKIE_AGE
  ? parseInt(process.env.COOKIE_AGE)
  : 1000 * 60 * 60 * 24 * 365 * 10; // 10 Years
export const SESSION_SECRET = process.env.SESSION_SECRET || "secret";
