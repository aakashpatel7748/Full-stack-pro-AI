import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js"
import mcpClient from "../../mcp/client.mcp.js";

let ai;
const getAI = () => {
  if (!ai) {
    if (!config.GOOGLE_GEMINI_KEY) {
      throw new Error("GOOGLE_GEMINI_KEY is missing in environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: config.GOOGLE_GEMINI_KEY });
  }
  return ai;
};

const tools = (await mcpClient.listTools()).tools;

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
    const aiInstance = getAI();
    const response = await aiInstance.models.generateContent({
      model: "gemini-1.5-flash-001",
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
    return "AI Error: " + (error.message || "Something went wrong while talking to Gemini.");
  }
}

export default getResponse;

