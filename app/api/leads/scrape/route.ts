import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Firecrawl from '@mendable/firecrawl-js';
import { Lead } from '@/lib/types';
import { SpreadsheetStore } from '@/lib/spreadsheet-store';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY || '' });

interface ScrapedPage {
  url?: string;
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}

// Scrape website content using Firecrawl
async function scrapeWebsite(url: string): Promise<ScrapedPage | null> {
  try {
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
    });

    if (scrapeResult.success) {
      return {
        url,
        markdown: scrapeResult.markdown,
        metadata: scrapeResult.metadata as ScrapedPage['metadata'],
      };
    }
    return null;
  } catch (error) {
    console.error('Firecrawl scrape error:', error);
    return null;
  }
}

// Search and scrape multiple pages for a query using Firecrawl Search (Improved)
async function searchAndScrape(query: string): Promise<ScrapedPage[]> {
  try {
    console.log(`[Scrape] Running Firecrawl search for: ${query}`);
    
    // Use Firecrawl's search endpoint which is more reliable than scraping Google
    const searchRes = await (firecrawl as unknown as { 
      search: (_: string, __: { limit: number; scrapeOptions: { formats: string[] } }) => Promise<{ 
        success: boolean; 
        data: Array<{ url: string; markdown: string; title: string; description: string }> 
      }> 
    }).search(query, {
      limit: 5,
      scrapeOptions: { formats: ['markdown'] }
    });

    if (searchRes.success && searchRes.data) {
      return searchRes.data.map((item: { url: string; markdown: string; title: string; description: string }) => ({
        url: item.url,
        markdown: item.markdown,
        metadata: {
          title: item.title,
          description: item.description
        }
      }));
    }

    return [];
  } catch (error) {
    console.error('Search and scrape error:', error);
    return [];
  }
}

// Use AI to extract lead information from scraped content
async function extractLeadsFromContent(
  scrapedContent: ScrapedPage[],
  query: string,
  maxResults: number
): Promise<Lead[]> {
  if (scrapedContent.length === 0) return [];

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const contentSummary = scrapedContent
    .map((page) => `### Source: ${page.url}\n${page.markdown?.slice(0, 8000) || 'No content'}`)
    .join('\n\n---\n\n');

  const prompt = `You are a real-world lead generation specialist. Extract accurate contact information from the provided content.

SEARCH CONTEXT: "${query}"

SCRAPED CONTENT:
${contentSummary}

EXTRACTION RULES:
1. Extract ONLY real people mentioned in the text.
2. Prioritize fields found EXPLICITLY in the text.
3. DO NOT hallucinate LinkedIn URLs. If a LinkedIn URL for the person is not in the text, leave the field empty.
4. DO NOT invent email addresses. If not found, use a professional format ONLY if you can infer the domain correctly from the website, otherwise leave empty.
5. Provide a quality score (1-100) based on how complete the found data is.

OUTPUT FORMAT: Return ONLY a valid JSON array. Each element:
{
  "name": "Full Name",
  "company": "Company Name",
  "role": "Job Title",
  "linkedin": "linkedin.com/in/username",
  "twitter": "@handle",
  "email": "email@domain.com",
  "website": "Company website",
  "score": 0-100,
  "tags": ["tag1", "tag2"]
}

If no real leads are found in the content, return an empty array []. DO NOT make up fictional people.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    // Find JSON array bounds
    const start = cleanedText.indexOf('[');
    const end = cleanedText.lastIndexOf(']');
    if (start === -1 || end === -1) return [];

    const extractedLeads = JSON.parse(cleanedText.slice(start, end + 1));

    const leads: Lead[] = extractedLeads.map((lead: {
      name?: string;
      company?: string;
      role?: string;
      linkedin?: string;
      twitter?: string;
      email?: string;
      website?: string;
      score?: number;
      tags?: string[];
    }) => ({
      id: uuidv4(),
      name: lead.name || 'Unknown',
      company: lead.company,
      role: lead.role,
      linkedin: lead.linkedin,
      twitter: lead.twitter,
      email: lead.email,
      website: lead.website,
      status: 'new' as const,
      score: typeof lead.score === 'number' ? lead.score : 50,
      signals: [],
      tags: lead.tags || [],
      source: 'firecrawl_real',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return leads.slice(0, maxResults);
  } catch (error) {
    console.error('Error extracting leads from content:', error);
    return [];
  }
}

// Scrape leads from a specific URL (Improved)
async function scrapeLeadsFromUrl(url: string, maxResults: number): Promise<Lead[]> {
  const scrapedPage = await scrapeWebsite(url);

  if (!scrapedPage?.markdown) {
    return [];
  }

  return extractLeadsFromContent([scrapedPage], `Extraction from ${url}`, maxResults);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, spreadsheetId, maxResults = 10, url } = body;

    if (!query && !url) {
      return NextResponse.json(
        { success: false, message: 'Query or URL is required' },
        { status: 400 }
      );
    }

    let leads: Lead[] = [];

    if (url) {
      leads = await scrapeLeadsFromUrl(url, maxResults);
    } else {
      const scrapedContent = await searchAndScrape(query);
      leads = await extractLeadsFromContent(scrapedContent, query, maxResults);
    }

    // FINAL GATE: If leads is empty, do NOT generate fake ones.
    // We notify the user instead.
    
    if (spreadsheetId && leads.length > 0) {
      const updated = SpreadsheetStore.addLeads(spreadsheetId, leads);
      if (!updated) {
        return NextResponse.json(
          { success: false, message: 'Spreadsheet not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      leads,
      message: leads.length > 0 
        ? `Successfully found and added ${leads.length} real leads.` 
        : `I searched the web but couldn't find any clear lead data for "${query || url}". Please try a more specific search.`,
      totalFound: leads.length,
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to scrape leads', error: String(error) },
      { status: 500 }
    );
  }
}
