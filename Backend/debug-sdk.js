import { GoogleGenAI } from "@google/genai";
import config from "./src/config/config.js";

const ai = new GoogleGenAI({ apiKey: config.GOOGLE_GEMINI_KEY });
console.log("Keys on GoogleGenAI instance:", Object.keys(ai));
if (ai.models) console.log("Keys on ai.models:", Object.keys(ai.models));
