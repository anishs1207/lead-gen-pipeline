import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are an AI-powered Spreadsheet assistant. You have full access to view and edit a 2-dimensional spreadsheet matrix.
The user will provide you with the current state of their spreadsheet, represented as a 2D array of cell objects: e.g. [[{"value": "A1"}, {"value": "B1"}], [{"value": "A2"}, {"value": "B2"}]].
The user will also provide a request describing what they want to change, add, delete, or analyze in the spreadsheet.

YOUR JOB:
1. Process the request.
2. If the user wants to add, modify, or delete data, perform those changes directly on the 2D array. Make sure you return the fully updated 2D array, matching the exact same row X column dimensions. If you don't know the exact columns, try to infer them from the first row (headers) if they exist.
3. Provide a friendly conversational response explaining what you did or answering their question.

RESPONSE FORMAT:
You MUST return ONLY valid JSON in the following format (no markdown formatting, no \`\`\`json wrappers):

{
  "response": "Your friendly, helpful verbal response.",
  "updatedData": [
    [{ "value": "Name" }, { "value": "Status" }, ...],
    [{ "value": "John Doe" }, { "value": "New" }, ...]
  ]
}

DO NOT include any markdown strings in your output, just the raw JSON object.
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();


    const { message, spreadsheetData } = body;

    if (!message) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const context = `CURRENT SPREADSHEET 2D ARRAY:
${JSON.stringify(spreadsheetData)}`;

    const prompt = `${SYSTEM_PROMPT}

Current Context:
${context}

User Message: ${message}

Analyze the request and respond with the updated 2D array and your conversational response in pure JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsedResponse;
    try {
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        parsedResponse = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse JSON", e, text);
        return NextResponse.json(
            { success: false, message: 'Failed to parse AI response' },
            { status: 500 }
        );
    }

    return NextResponse.json({
      success: true,
      response: parsedResponse.response,
      updatedData: parsedResponse.updatedData
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process chat message', error: String(error) },
      { status: 500 }
    );
  }
}
