import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import path from "path";
import { log } from "node:console";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const apiKey: string = GEMINI_API_KEY;

type MCPTool = {
  name: string;
  description?: string;
  input_schema?: unknown;
};

/* =======================
   MCP CLIENT
======================= */

function extractJson(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

class MCPClient {
  private mcp: Client;
  private transport: StdioClientTransport | null = null;
  private tools: MCPTool[] = [];

  private gemini;
  private model;

  constructor() {
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });

    this.gemini = new GoogleGenerativeAI(apiKey);
    this.model = this.gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
  }

  async connectToServer(serverScriptPath: string) {
    if (!serverScriptPath.endsWith(".js")) {
      throw new Error("Server script must be a .js file");
    }

    this.transport = new StdioClientTransport({
      command: process.execPath,
      args: [serverScriptPath],
    });

    await this.mcp.connect(this.transport);

    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((t: any) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema,
    }));

    console.log(
      "Connected to server with tools:",
      this.tools.map((t) => t.name),
    );
  }

  async processQuery(query: string): Promise<string> {
    const toolSelectionPrompt = `
  You are an AI assistant with access to tools.

  TOOLS:
  ${JSON.stringify(this.tools, null, 2)}

  RULES:
  - Decide whether a tool is needed.
  - If a tool is needed, respond ONLY with JSON in this exact shape:
  {
    "tool": "<tool_name>",
    "arguments": { ... }
  }
  - If no tool is needed, respond with plain natural language.
  - DO NOT explain tools.
  `;

    let responseText = await this.askGemini(toolSelectionPrompt, query);

    log("resppneText", responseText);

    // return responseText;

    let parsed: any;
    try {
      const cleaned = extractJson(responseText);
      log("cleaned", cleaned);
      parsed = JSON.parse(cleaned);
      log("parsed", parsed);
    } catch {
      log("tool is not called");
      // ✅ No tool needed → return answer directly
      return responseText.trim();
    }
    log("parsed", parsed);

    // 3️⃣ If no tool specified → return safely
    if (!parsed?.tool) {
      console.log("no tools returned");
      return responseText.trim();
    }

    log("tool to be called");

    // 4️⃣ Call the tool
    const toolResult = await this.mcp.callTool({
      name: parsed.tool,
      arguments: parsed.arguments ?? {},
    });

    log("tool is already called");

    const toolText =
      toolResult.content
        ?.map((c: any) => c.text)
        .filter(Boolean)
        .join("\n") || "No information available.";

    // 5️⃣ FORCE final natural language answer
    const finalPrompt = `
  You are an AI assistant.

  A tool has already been executed.
  You MUST NOT call any tools again.
  You MUST NOT output JSON.

  Return output in natural lanuage only but in markdown format.

  Tool output:
  ${toolText}

  Now answer the user clearly and concisely.
  `;

    const finalAnswer = await this.askGemini(
      finalPrompt,
      "Provide the final answer to the user.",
    );

    log("finalAnser", finalAnswer);

    // 6️⃣ Absolute safety: strip accidental JSON
    if (finalAnswer.trim().startsWith("{")) {
      return "I retrieved the information successfully, but could not format it properly.";
    }

    return finalAnswer.trim();
  }

  private async askGemini(system: string, user: string): Promise<string> {
    const result = await this.model.generateContent([
      { text: system },
      { text: user },
    ]);

    return result.response.text() || "";
  }

  async cleanup() {
    try {
      await this.mcp.close();
    } catch {
      // ignore cleanup errors
    }
  }
}

/* =======================
   ENTRY FUNCTION
======================= */

export default async function callMCPServer(prompt: string): Promise<string> {
  if (!prompt?.trim()) return "";

  const mcpServerPath = path.resolve(process.cwd(), "../server/dist/index.js");

  const client = new MCPClient();

  try {
    await client.connectToServer(mcpServerPath);
    const response = await client.processQuery(prompt);
    console.log("response rtened", response);
    return response;
  } catch (e) {
    console.error("Error:", e);
    return "An error occurred while processing your request.";
  } finally {
    await client.cleanup();
  }
}
