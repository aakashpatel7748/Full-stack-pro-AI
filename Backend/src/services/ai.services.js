import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js"
import mcpClient from "../../mcp/client.mcp.js";

const ai = new GoogleGenAI({ apiKey: config.GOOGLE_GEMINI_KEY });

const tools = (await mcpClient.listTools()).tools;
// console.log("Tools available:", tools[0]);


function getSystemInstruction(user) {
  return `
  <persona>
  You are a helpful  assistant. that can halp the user with their tasks. you have access to a set of tools that can help you with your tasks.
  </persona>

  <important>
  you are not allowed to use any other tools or APIs other then the ones provided  to you .

  corrently you are acting to behalf of ${user.name} with the email ${user.email}and userId ${user._id}.
  </important>
  `
}

async function getResponse(messages, user) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: messages,
      config: {
        systemInstruction: getSystemInstruction(user),
        tools: [{
          functionDeclarations: tools.map((tool) => {
            return {
              name: tool.name,
              description: tool.description,
              parameters: {
                type: tool.inputSchema.type,
                properties: tool.inputSchema.properties,
                required: tool.inputSchema.required,
              }
            }
          })
        }]
      }
    });

    const functionCall = response.functionCalls && response.functionCalls[0];
    if (functionCall) {
      const toolResult = await mcpClient.callTool({
        name: functionCall.name,
        arguments: functionCall.args
      })
      const result = toolResult.content[0].text;
      return result;
    }
    const text = response.text
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    if (error.message.includes("429")) {
      return "AI Limit Exceeded (429): Please wait a minute before trying again. The free tier has a limit of 15-20 requests per minute.";
    }
    return "AI Error: Something went wrong while talking to Gemini. Please try again later.";
  }
}

export default getResponse;

