import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js";

const ai = new GoogleGenAI({ apiKey: config.GOOGLE_GEMINI_KEY });

export const calculateATSScore = async (resumeText, jobDescription = "") => {
    console.log("ATS Score Calculation Started...");

    if (!resumeText || resumeText.trim().length < 10) {
        throw new Error("Resume text is too short or empty. Please make sure the PDF contains readable text.");
    }

    const prompt = `
    You are a professional Resume Analyzer and ATS Optimizer. 
    Analyze the resume text provided and give a detailed ATS report.

    ${jobDescription ? `Compare against this Job Description:\n${jobDescription}` : "Evaluate based on general industry standards."}

    RESUME TEXT:
    ${resumeText}

    Output format:
    1. Overall Score (0-100)
    2. Missing Keywords
    3. Formatting Feedback
    4. Improvement Suggestions
    5. Key Strengths
    `;

    try {
        // Using gemini-2.5-flash as it is verified working in this project
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const text = response.text;

        if (!text) throw new Error("AI returned an empty response.");

        console.log("Gemini Analysis Successful.");
        return text;
    } catch (error) {
        console.error("Gemini API Error (Detailed):", error);
        throw new Error("AI Analysis Error: " + (error.message || "Failed to process resume analysis through Gemini."));
    }
};
