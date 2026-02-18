import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpreadsheetStore } from '@/lib/spreadsheet-store';
import { ChatResponse, Lead, LeadStatus } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for the AI
const SYSTEM_PROMPT = `You are an AI-powered CRM assistant with FULL ACCESS to manipulate the lead spreadsheet. You can understand natural language and perform ANY action on the data.

🚀 FULL SPREADSHEET ACCESS:
You have COMPLETE capability to modify, analyze, and manage ALL spreadsheet data. NEVER refuse a data modification request.

📋 AVAILABLE ACTIONS:

1. **add** - Add new leads to the spreadsheet
   - Single: "Add John Smith from Acme Corp as a Sales Director"
   - Bulk: "Add these 5 leads: [names and details]"
   - Data fields: name, company, role, email, linkedin, twitter, website, phone, score, notes, status

2. **update** - Update existing lead properties
   - Single: "Mark John Smith as qualified"
   - Bulk: "Update all Acme Corp leads to contacted status"
   - Fields: status, score, notes, company, role, email, linkedin, twitter, website, phone

3. **delete** - Remove leads from the spreadsheet
   - Single: "Delete the lead named John Smith"
   - Bulk: "Remove all lost leads"
   - Filter-based: "Delete leads with score below 30"

4. **filter** - Show leads matching specific criteria
   - "Show me only qualified leads"
   - "Filter leads with score > 80"

5. **sort** - Sort leads by any column
   - "Sort by score descending"
   - "Order leads by company name"

6. **search** - Find specific leads
   - "Find leads named John"
   - "Search for anyone at Google"

7. **addColumn** - Add a new column to the spreadsheet
   - "Add a column called 'Priority'"
   - Data: { key: "column_key", label: "Column Label", type: "text" }

8. **deleteColumn** - Remove a column from the spreadsheet
   - "Remove the Notes column"
   - Data: { columnId: "column_id" }

9. **none** - General questions, analysis, or conversation
   - "What's the average lead score?"
   - "How many qualified leads do we have?"

📝 RESPONSE FORMAT:
Always return valid JSON only (no markdown):
{
  "response": "Your friendly, helpful response explaining what was done or answering the question",
  "action": {
    "type": "add|update|delete|filter|sort|search|addColumn|deleteColumn|none",
    "data": {
      // For ADD: { name, company, role, email, linkedin, twitter, website, phone, score, notes, status }
      // For UPDATE: { status?, score?, notes?, company?, role?, email?, linkedin?, twitter?, searchCriteria? }
      // For FILTER: { status?, score?: { gte?, lte? }, company?: { contains? } }
      // For SORT: { key: "fieldName", order: "asc"|"desc" }
      // For SEARCH: { query: "search string" }
      // For addColumn: { key: "column_key", label: "Column Label", type: "text" }
      // For deleteColumn: { columnId: "column_id" }
    },
    "affectedRows": ["lead_id_1", "lead_id_2"] // IDs of leads to update/delete
  }
}

📊 DATA RULES:
- Valid status values: new, contacted, replied, qualified, closed, lost
- Score range: 0-100 (default: 50 for new leads)
- For updates, always include affectedRows with the lead IDs from the data provided
- For bulk updates, use searchCriteria to find matching leads by name/company

🎯 BE PROACTIVE:
- If user says "add lead" with partial info, add it with reasonable defaults
- If user wants to update "John", search for leads named John in the data
- When analyzing, use the actual data provided to give specific numbers
- Be conversational but action-oriented

CRITICAL: You MUST perform the action when requested. Never say "I cannot modify data" - you CAN and SHOULD.`;


// Helper to find leads matching criteria
function findMatchingLeads(leads: Lead[], criteria: string): string[] {
  const lowerCriteria = criteria.toLowerCase();
  return leads
    .filter((lead) => {
      const searchableText = [
        lead.name,
        lead.company,
        lead.role,
        lead.email,
        lead.status,
        ...(lead.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(lowerCriteria);
    })
    .map((lead) => lead.id);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, spreadsheetId, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    // Get current spreadsheet data
    let spreadsheetData = null;
    if (spreadsheetId) {
      spreadsheetData = SpreadsheetStore.get(spreadsheetId);
    }

    if (!spreadsheetData) {
      return NextResponse.json({
        success: true,
        response: "No spreadsheet is currently selected. Please select or create a spreadsheet first.",
        action: { type: 'none' }
      });
    }

    // Build context for AI with full spreadsheet data
    const leadsContext = spreadsheetData.leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      role: lead.role,
      email: lead.email,
      linkedin: lead.linkedin,
      twitter: lead.twitter,
      website: lead.website,
      phone: lead.phone,
      status: lead.status,
      score: lead.score,
      notes: lead.notes,
    }));

    const columnsContext = spreadsheetData.columns.map((col) => ({
      id: col.id,
      key: col.key,
      label: col.label,
      type: col.type,
    }));

    const context = `SPREADSHEET DATA:
Name: "${spreadsheetData.name}"
ID: "${spreadsheetData.id}"
Total leads: ${spreadsheetData.leads.length}

COLUMNS:
${JSON.stringify(columnsContext, null, 2)}

FULL LEAD DATA (use these IDs for updates/deletes):
${JSON.stringify(leadsContext, null, 2)}

Valid status values: new, contacted, replied, qualified, closed, lost
Score range: 0-100`;

    // Build conversation for AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `${SYSTEM_PROMPT}

Current Context:
${context}

Recent Conversation:
${conversationHistory
  .slice(-6)
  .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
  .join('\n')}

User Message: ${message}

Analyze the request and respond with the appropriate action. Remember to include lead IDs in affectedRows for update/delete operations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    let parsedResponse: ChatResponse;
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch {
      parsedResponse = {
        response: text,
        action: undefined,
      };
    }

    // Execute the action if applicable
    if (parsedResponse.action && spreadsheetId && spreadsheetData) {
      const action = parsedResponse.action;

      switch (action.type) {
        case 'filter':
          if (action.data) {
            const filtered = SpreadsheetStore.filterLeads(
              spreadsheetId,
              action.data as Record<string, unknown>
            );
            parsedResponse.updatedData = {
              ...spreadsheetData,
              leads: filtered,
            };
            parsedResponse.action.affectedRows = filtered.map((l) => l.id);
          }
          break;

        case 'sort':
          if (action.data) {
            const { key, order } = action.data as { key: string; order: 'asc' | 'desc' };
            const sorted = SpreadsheetStore.sortLeads(spreadsheetId, key, order || 'asc');
            parsedResponse.updatedData = {
              ...spreadsheetData,
              leads: sorted,
            };
          }
          break;

        case 'update':
          if (action.data) {
            let rowsToUpdate = action.affectedRows || [];

            // If no specific rows mentioned, try to find matching leads by name/criteria
            if (rowsToUpdate.length === 0 && action.data) {
              const data = action.data as Record<string, unknown>;
              if (data.searchCriteria) {
                rowsToUpdate = findMatchingLeads(
                  spreadsheetData.leads,
                  data.searchCriteria as string
                );
              }
            }

            if (rowsToUpdate.length > 0) {
              // Extract the actual update fields (excluding searchCriteria)
              const updateData = { ...action.data } as Record<string, unknown>;
              delete updateData.searchCriteria;

              SpreadsheetStore.bulkUpdateLeads(
                spreadsheetId,
                rowsToUpdate,
                updateData as Partial<Lead>
              );
              parsedResponse.updatedData = SpreadsheetStore.get(spreadsheetId);
              parsedResponse.action.affectedRows = rowsToUpdate;
            }
          }
          break;

        case 'delete':
          if (action.affectedRows && action.affectedRows.length > 0) {
            for (const leadId of action.affectedRows) {
              SpreadsheetStore.deleteLead(spreadsheetId, leadId);
            }
            parsedResponse.updatedData = SpreadsheetStore.get(spreadsheetId);
          }
          break;

        case 'add':
          if (action.data) {
            const rawData = action.data;
            const leadsToAdd: Lead[] = [];
            
            // Check if it's an array of leads (bulk add) or a single lead
            const isArray = Array.isArray(rawData) || (rawData as Record<string, unknown>).leads;
            const leadDataArray = isArray 
              ? (Array.isArray(rawData) ? rawData : (rawData as Record<string, unknown>).leads as Record<string, unknown>[])
              : [rawData];
            
            for (const newLeadData of leadDataArray) {
              const lead = newLeadData as Record<string, unknown>;
              const newLead: Lead = {
                id: uuidv4(),
                name: (lead.name as string) || 'New Lead',
                company: (lead.company as string) || '',
                role: (lead.role as string) || '',
                linkedin: (lead.linkedin as string) || '',
                twitter: (lead.twitter as string) || '',
                email: (lead.email as string) || '',
                website: (lead.website as string) || '',
                phone: (lead.phone as string) || '',
                status: ((lead.status as LeadStatus) || 'new') as LeadStatus,
                score: (lead.score as number) || 50,
                signals: [],
                tags: [],
                notes: (lead.notes as string) || '',
                source: 'chat',
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              leadsToAdd.push(newLead);
            }

            if (leadsToAdd.length > 0) {
              SpreadsheetStore.addLeads(spreadsheetId, leadsToAdd);
              parsedResponse.updatedData = SpreadsheetStore.get(spreadsheetId);
              parsedResponse.action.affectedRows = leadsToAdd.map(l => l.id);
            }
          }
          break;

        case 'search':
          if (action.data) {
            const searchResults = SpreadsheetStore.filterLeads(
              spreadsheetId,
              action.data as Record<string, unknown>
            );
            parsedResponse.updatedData = {
              ...spreadsheetData,
              leads: searchResults,
            };
            parsedResponse.action.affectedRows = searchResults.map((l) => l.id);
          }
          break;

        case 'addColumn':
          if (action.data) {
            const colData = action.data as { key: string; label: string; type?: string };
            SpreadsheetStore.addColumn(spreadsheetId, {
              id: uuidv4(),
              key: colData.key || colData.label.toLowerCase().replace(/\s+/g, '_'),
              label: colData.label,
              type: 'text', // Default to text type for custom columns
            });
            parsedResponse.updatedData = SpreadsheetStore.get(spreadsheetId);
          }
          break;

        case 'deleteColumn':
          if (action.data) {
            const deleteColData = action.data as { columnId: string };
            SpreadsheetStore.removeColumn(spreadsheetId, deleteColData.columnId);
            parsedResponse.updatedData = SpreadsheetStore.get(spreadsheetId);
          }
          break;
      }
    }

    return NextResponse.json({
      success: true,
      ...parsedResponse,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process chat message', error: String(error) },
      { status: 500 }
    );
  }
}
