import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpreadsheetStore } from '@/lib/spreadsheet-store';
import { Signal, Lead } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Analyze leads for signals using AI
async function analyzeLeadSignals(lead: Lead): Promise<Signal[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `Analyze this lead and suggest potential buying signals based on their profile:

Lead: ${JSON.stringify({
    name: lead.name,
    company: lead.company,
    role: lead.role,
    score: lead.score,
    tags: lead.tags,
  })}

Suggest 0-3 realistic signals that might indicate buying intent. Each signal should have:
- type: one of "job_change", "funding", "hiring", "content_engagement", "website_visit", "social_mention"
- description: brief description of the signal
- strength: "low", "medium", or "high"

Return ONLY a valid JSON array of signals, no markdown.
If no signals are appropriate, return an empty array [].`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const signals = JSON.parse(cleanedText);
    
    return signals.map((s: { type: Signal['type']; description: string; strength: Signal['strength'] }) => ({
      id: uuidv4(),
      type: s.type,
      description: s.description,
      strength: s.strength,
      detectedAt: new Date(),
    }));
  } catch (error) {
    console.error('Signal analysis error:', error);
    return [];
  }
}

// POST - Analyze and detect signals for leads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadsheetId, leadIds, analyzeAll = false } = body;

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }

    const spreadsheet = SpreadsheetStore.get(spreadsheetId);
    if (!spreadsheet) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet not found' },
        { status: 404 }
      );
    }

    // Get leads to analyze
    let leadsToAnalyze = spreadsheet.leads;
    if (!analyzeAll && leadIds && leadIds.length > 0) {
      leadsToAnalyze = spreadsheet.leads.filter(lead => leadIds.includes(lead.id));
    }

    // Limit to avoid rate limiting
    const maxLeads = 10;
    if (leadsToAnalyze.length > maxLeads) {
      leadsToAnalyze = leadsToAnalyze.slice(0, maxLeads);
    }

    const results: { leadId: string; name: string; signals: Signal[] }[] = [];

    // Analyze each lead
    for (const lead of leadsToAnalyze) {
      const signals = await analyzeLeadSignals(lead);
      
      if (signals.length > 0) {
        // Update the lead with new signals
        const existingSignals = lead.signals || [];
        const newSignals = [...existingSignals, ...signals];
        
        SpreadsheetStore.updateLead(spreadsheetId, lead.id, { 
          signals: newSignals,
          // Update score based on signals
          score: Math.min(100, lead.score + (signals.length * 5)),
        });
        
        results.push({
          leadId: lead.id,
          name: lead.name,
          signals,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Analyzed ${leadsToAnalyze.length} leads, found signals for ${results.length}`,
      results,
      spreadsheet: SpreadsheetStore.get(spreadsheetId),
    });
  } catch (error) {
    console.error('Signal detection error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to detect signals', error: String(error) },
      { status: 500 }
    );
  }
}

// GET - Get signals summary for a spreadsheet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId');

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }

    const spreadsheet = SpreadsheetStore.get(spreadsheetId);
    if (!spreadsheet) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet not found' },
        { status: 404 }
      );
    }

    // Aggregate signals
    const signalSummary: Record<string, { count: number; leads: string[] }> = {};
    const highPriorityLeads: { id: string; name: string; score: number; signalCount: number }[] = [];

    for (const lead of spreadsheet.leads) {
      if (lead.signals && lead.signals.length > 0) {
        for (const signal of lead.signals) {
          if (!signalSummary[signal.type]) {
            signalSummary[signal.type] = { count: 0, leads: [] };
          }
          signalSummary[signal.type].count++;
          signalSummary[signal.type].leads.push(lead.name);
        }

        // Track high priority leads (score > 70 or multiple signals)
        if (lead.score > 70 || lead.signals.length >= 2) {
          highPriorityLeads.push({
            id: lead.id,
            name: lead.name,
            score: lead.score,
            signalCount: lead.signals.length,
          });
        }
      }
    }

    // Sort high priority leads by score
    highPriorityLeads.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      summary: {
        totalLeads: spreadsheet.leads.length,
        leadsWithSignals: spreadsheet.leads.filter(l => l.signals && l.signals.length > 0).length,
        signalsByType: signalSummary,
        highPriorityLeads: highPriorityLeads.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Get signals error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get signals', error: String(error) },
      { status: 500 }
    );
  }
}
