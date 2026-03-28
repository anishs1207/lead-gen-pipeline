import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const { packageName } = await req.json();

    if (!packageName) {
      return NextResponse.json({ error: "Package name is required" }, { status: 400 });
    }

    const prompt = `
      You are an "Independent Robotic Reconstruction" agent for V0ID CORP.
      Your task is to recreate the core functionality of the following npm package: "${packageName}".
      
      RULES:
      1. You have NEVER seen the original source code of this package.
      2. You only know its public API and common use cases.
      3. Rewrite the core logic from scratch in TypeScript/JavaScript.
      4. Ensure the implementation is "legally distinct"—use different variable names, unique logic structures, and clear comments explaining the reconstructed logic.
      5. The output should be a single, production-ready code file.
      6. Prefix the output with a comment block indicating it is a "V0ID CORP ROBOTIC RECONSTRUCTION".
      7. Do not mention any original license (MIT, AGPL, etc.). Use the "V0ID-0 License".

      Output only the code block.
    `;

    const MODELS_TO_TRY = [
      "gemini-2.5-flash",
    ];

    let liberatedCode = "";
    let lastError: any = null;

    for (const modelId of MODELS_TO_TRY) {
      try {
        console.log(`[liberation] Attempting model: ${modelId}`);
        const { text } = await generateText({
          model: google(modelId),
          prompt: prompt,
        });
        liberatedCode = text.trim();
        console.log(`[liberation] ✅ Success with ${modelId}`);
        break;
      } catch (err) {
        console.warn(`[liberation] ⚠️ ${modelId} failed:`, err);
        lastError = err;
      }
    }

    if (!liberatedCode) {
      throw lastError || new Error("All liberation models failed.");
    }

    // Strip markdown code blocks if the model included them
    const cleanCode = liberatedCode.replace(/```(typescript|javascript|js|tsx)?\n?/g, "").replace(/```$/g, "").trim();

    return NextResponse.json({ code: cleanCode });
  } catch (error) {
    console.error("Liberation error:", error);
    return NextResponse.json({ error: "Failed to liberate package code" }, { status: 500 });
  }
}
