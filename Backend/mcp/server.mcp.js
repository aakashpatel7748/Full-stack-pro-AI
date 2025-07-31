import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { sendEmail } from "../src/services/google.service.js";
import config from "../src/config/config.js";
import mongoose from "mongoose";
import { z } from "zod";
import fs from "fs";


mongoose.connect(config.MONGODB_URI,)

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


// server.tool(
//   "clearChat",
//   "clear the chat context or session",
//   {},
//   async () => {
//     // If you are storing chat history in DB or in memory, clear it here

//     return {
//       content: [
//         {
//           type: "text",
//           text: "Chat has been cleared successfully."
//         }
//       ]
//     };
//   }
// );


// ... set up server resources, tools, and prompts ...

const transport = new StdioServerTransport();
await server.connect(transport);