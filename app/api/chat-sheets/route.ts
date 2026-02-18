// tale sthe data object adn returns dat betc

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SpreadsheetStore } from "@/lib/spreadsheet-store";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


/*
Sheets: access to it
v1: give it direct access to data (rows & cols here)
v2:
- instead of expose actions & validate and then take them here
- use and pass data to it here

allowed actions:
updateCell()
updateRow()
deleteRow()
addRow()

tec and send back some actions


actions =

[{
actionType:
itemsRelatedTOIT:
}]

to take actions here to make it hallucinate here


get leads and add them here

use of google search apis and also use of firecrawl api for it


*/

export async function GET(req: NextRequest) {

}

// export async function POST(req: NextRequest) {
//   const { message, sheetId } = await req.json();

//   const sheet = SpreadsheetStore.get(sheetId);
//   if (!sheet) {
//     return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
//   }

//   // 🔐 Minimal context only
//   const context = {
//     columns: sheet.columns.map(c => ({
//       id: c.id,
//       label: c.label,
//       key: c.key,
//     })),
//     rows: sheet.rows.map(r => ({
//       id: r.id,
//       values: r.values,
//     })),
//   };

//   const systemPrompt = `
// You are a spreadsheet assistant.

// You DO NOT have direct access to data.
// You may ONLY return one action from the list below.

// Allowed actions:
// - updateCell(rowId, columnId, value)
// - updateRow(rowId, data)
// - deleteRow(rowId)
// - addRow(data)
// - none

// Return JSON ONLY.

// Spreadsheet structure:
// ${JSON.stringify(context, null, 2)}
// `;

//   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//   const result = await model.generateContent([
//     { role: "system", parts: [{ text: systemPrompt }] },
//     { role: "user", parts: [{ text: message }] },
//   ]);

//   let action;
//   try {
//     action = JSON.parse(result.response.text());
//   } catch {
//     return NextResponse.json({ error: "Invalid AI response" }, { status: 400 });
//   }

//   // 🔒 Validate + Execute
//   switch (action.type) {
//     case "updateCell":
//       SpreadsheetStore.updateCell(
//         sheetId,
//         action.rowId,
//         action.columnId,
//         action.value
//       );
//       break;

//     case "updateRow":
//       SpreadsheetStore.updateRow(sheetId, action.rowId, action.data);
//       break;

//     case "deleteRow":
//       SpreadsheetStore.deleteRow(sheetId, action.rowId);
//       break;

//     case "addRow":
//       SpreadsheetStore.addRow(sheetId, action.data);
//       break;
//   }

//   return NextResponse.json({ success: true, action });
// }


export async function GET(req: NextRequest) {

}