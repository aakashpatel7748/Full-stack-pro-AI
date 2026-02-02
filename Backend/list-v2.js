import { GoogleGenAI } from "@google/genai";
import config from "./src/config/config.js";

const ai = new GoogleGenAI({ apiKey: config.GOOGLE_GEMINI_KEY });

async function check() {
    try {
        const models = await ai.models.list();
        if (models.pageInternal) {
            models.pageInternal.forEach(m => console.log(m.name));
        } else {
            console.log(JSON.stringify(models, null, 2));
        }
    } catch (e) {
        console.log("List failed:", e.message);
    }
}
check();
