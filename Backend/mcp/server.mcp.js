import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { sendEmail } from "../src/services/google.service.js";
import config from "../src/config/config.js";
import mongoose from "mongoose";
import { z } from "zod";
import fs from "fs";
import { clearMessages } from "../src/services/cache.service.js";
import { calculateATSScore } from "../src/services/ats.service.js";


if (config.MONGODB_URI) {
    mongoose.connect(config.MONGODB_URI).catch(err => console.error("MCP MongoDB Connection Error:", err));
} else {
    console.warn("MCP Server: MONGODB_URI is undefined, skipping DB connection.");
}

const server = new McpServer({
    name: "example-server",
    version: "1.0.0"
});

// server.tool("tool name", "discrption",{arguments}, function to execute);

server.tool(
    "sendEmail",
    "send an email",
    {
        userid: z.string(),
        to: z.string(),
        subject: z.string(),
        messages: z.string(),
    },
    async ({ userid, to, subject, messages }) => {
        try {
            const result = await sendEmail(
                userid,
                to,
                subject,
                messages
            );
            return {
                content: [{
                    type: "text",
                    text: `Email sent to ${to} with subject "${subject}".`
                }],

            };
        } catch (error) {
            console.error("Error sending email:", error);


            fs.appendFileSync("./mcp.error.json", JSON.stringify({

                userid,
                to,
                subject,
                messages,
                error: error.message
            }));



            return {
                content: [{
                    type: "text",
                    text: `Failed to send email: ${error.message}`
                }],
            };
        }
    }
)

server.tool(
    "addToNumbers",
    "add two numbers",
    {
        a: z.number(),
        b: z.number()
    },
    async ({ a, b }) => {
        const result = a + b;

        return {
            content: [{
                type: "text",
                text: `The result of adding ${a} and ${b} is ${result}.`

            }]
        }
    }
)

server.tool(
    "clearChat",
    "clear the chat history for a specific user",
    {
        userid: z.string().describe("The ID of the user whose chat history should be cleared")
    },
    async ({ userid }) => {
        try {
            await clearMessages(`connection:${userid}`);
            return {
                content: [
                    {
                        type: "text",
                        text: "Chat has been cleared successfully."
                    }
                ]
            };
        } catch (error) {
            console.error("Error clearing chat:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to clear chat: ${error.message}`
                    }
                ]
            };
        }
    }
);

server.tool(
    "analyzeResume",
    "Analyze a resume text and provide an ATS score and feedback",
    {
        resumeText: z.string().describe("The full text content of the resume"),
        jobDescription: z.string().optional().describe("Optional job description to compare the resume against")
    },
    async ({ resumeText, jobDescription }) => {
        try {
            const analysis = await calculateATSScore(resumeText, jobDescription);
            return {
                content: [{
                    type: "text",
                    text: analysis
                }]
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Error analyzing resume: ${error.message}`
                }]
            };
        }
    }
);


// ... set up server resources, tools, and prompts ...

const transport = new StdioServerTransport();
await server.connect(transport);