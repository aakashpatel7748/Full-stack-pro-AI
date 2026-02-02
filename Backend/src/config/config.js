import { config } from "dotenv";
config();

const _config = {
    PORT: process.env.PORT || 4000,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL || "",
    GOOGLE_SECRET_KEY: process.env.GOOGLE_SECRET_KEY || "",
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_GEMINI_KEY: process.env.GOOGLE_GEMINI_KEY
}


export default Object.freeze(_config)