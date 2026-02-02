import express from "express";
import multer from "multer";
import { createRequire } from "module";
import { calculateATSScore } from "../services/ats.service.js";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
    try {
        console.log("--- Resume Analysis Request ---");

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        let resumeText = "";

        if (req.file.mimetype === "application/pdf") {
            console.log("Parsing PDF with pdf-parse...");
            try {
                const data = await pdf(req.file.buffer);
                resumeText = data.text;
                console.log("PDF parsed successfully, text length:", resumeText.length);
            } catch (pdfErr) {
                console.error("PDF Parsing Library Error:", pdfErr);
                throw new Error("Failed to extract text from PDF file.");
            }
        } else {
            resumeText = req.file.buffer.toString("utf-8");
        }

        if (!resumeText || resumeText.trim().length < 10) {
            throw new Error("Could not extract enough text from the file.");
        }

        const jobDescription = req.body.jobDescription || "";
        const analysis = await calculateATSScore(resumeText, jobDescription);

        res.json({ analysis });
    } catch (error) {
        console.error("Route Error:", error);
        res.status(500).json({
            message: "Error analyzing resume",
            error: error.message
        });
    }
});

export default router;
