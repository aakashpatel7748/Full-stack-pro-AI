import { GoogleGenAI } from "@google/genai";
import config from "./src/config/config.js";

const genAI = new GoogleGenAI({ apiKey: config.GOOGLE_GEMINI_KEY });

async function listModels() {
    try {
        // Note: listModels might not be available on the top-level genAI object 
        // depending on the version, but let's try.
        const models = await genAI.listModels();
        console.log("Available models:");
        models.models.forEach(m => console.log(m.name));
    } catch (e) {
        console.log("Could not list models via SDK:", e.message);
        console.log("Trying alternative approach...");
        // If listModels isn't there, we'll just try to hit gemini-1.5-flash with a simple prompt
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("test");
            console.log("gemini-1.5-flash is working!");
        } catch (err) {
            console.error("gemini-1.5-flash failed:", err.message);
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("test");
            console.log("gemini-pro is working!");
        } catch (err) {
            console.error("gemini-pro failed:", err.message);
        }
    }
}

listModels();
