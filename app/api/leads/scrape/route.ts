import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Firecrawl from '@mendable/firecrawl-js';
import { Lead, ScrapeResponse } from '@/lib/types';
import { SpreadsheetStore } from '@/lib/spreadsheet-store';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY || '' });

interface ScrapedPage {
  url?: string;
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
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

// Search and scrape multiple pages for a query
async function searchAndScrape(query: string): Promise<ScrapedPage[]> {
  try {
    // Use Firecrawl's map feature to find relevant URLs, or scrape a search query directly
    // For now, we'll try to search and get content from a few relevant sources
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    // Try to get search results page (may be blocked by Google)
    const searchResult = await scrapeWebsite(searchUrl);
    
    if (searchResult?.markdown) {
      return [searchResult];
    }

    // Fallback: try to scrape LinkedIn search or other sources
    // This is a simplified approach - in production you'd use proper search APIs
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const contentSummary = scrapedContent
    .map((page) => `URL: ${page.url}\nContent: ${page.markdown?.slice(0, 5000) || 'No content'}`)
    .join('\n\n---\n\n');

  const prompt = `You are a lead generation specialist. Based on the following scraped web content and search query, extract real contact/lead information.

Search Query: "${query}"

Scraped Content:
${contentSummary || 'No content was scraped. Please generate realistic leads based on the query.'}

Extract up to ${maxResults} leads with these fields:
- name: Full name (real or realistic)
- company: Company name
- role: Job title
- linkedin: LinkedIn URL (use format: linkedin.com/in/username)
- twitter: Twitter handle (use format: @username)
- email: Professional email (realistic format)
- website: Company website (optional)
- score: Lead quality score 1-100 (based on relevance to query)
- tags: Array of relevant tags

IMPORTANT: If the scraped content contains real people/companies, use that data. Otherwise, generate realistic mock leads that match the search query context.

Return ONLY a valid JSON array of leads, no markdown formatting or extra text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const extractedLeads = JSON.parse(cleanedText);

    // Transform to our Lead format
    const leads: Lead[] = extractedLeads.map((lead: Record<string, unknown>) => ({
      id: uuidv4(),
      name: (lead.name as string) || 'Unknown',
      company: lead.company as string,
      role: lead.role as string,
      linkedin: lead.linkedin as string,
      twitter: lead.twitter as string,
      email: lead.email as string,
      website: lead.website as string,
      status: 'new' as const,
      score: typeof lead.score === 'number' ? lead.score : 50,
      signals: [],
      tags: [],
      source: scrapedContent.length > 0 ? 'firecrawl' : 'ai_generated',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return leads;
  } catch (error) {
    console.error('Error extracting leads from content:', error);
    return [];
  }
}

// Scrape leads from a specific URL
async function scrapeLeadsFromUrl(url: string, maxResults: number): Promise<Lead[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Scrape the URL using Firecrawl
  const scrapedPage = await scrapeWebsite(url);

  if (!scrapedPage?.markdown) {
    console.log('Could not scrape URL, falling back to AI generation');
    return [];
  }

  const prompt = `You are a lead generation specialist. Analyze this scraped webpage content and extract potential leads/contacts.

URL: ${url}
Content:
${scrapedPage.markdown.slice(0, 10000)}

Extract up to ${maxResults} leads with these fields:
- name: Full name
- company: Company name (from the website/content)
- role: Job title/role
- linkedin: LinkedIn URL if found
- twitter: Twitter handle if found
- email: Email if found
- website: The source website
- score: Lead quality score 1-100
- tags: Relevant tags based on the content

Return ONLY a valid JSON array of leads, no markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const extractedLeads = JSON.parse(cleanedText);

    const leads: Lead[] = extractedLeads.map((lead: Record<string, unknown>) => ({
      id: uuidv4(),
      name: (lead.name as string) || 'Unknown',
      company: lead.company as string,
      role: lead.role as string,
      linkedin: lead.linkedin as string,
      twitter: lead.twitter as string,
      email: lead.email as string,
      website: url,
      status: 'new' as const,
      score: typeof lead.score === 'number' ? lead.score : 50,
      signals: [],
      tags: [],
      source: 'firecrawl',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return leads;
  } catch (error) {
    console.error('Error extracting leads from URL:', error);
    return [];
  }
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

    // If a specific URL is provided, scrape that URL
    if (url) {
      console.log(`Scraping URL: ${url}`);
      leads = await scrapeLeadsFromUrl(url, maxResults);
    } else {
      // Otherwise, search and scrape based on query
      console.log(`Searching for: ${query}`);
      
      // Try to scrape relevant content
      const scrapedContent = await searchAndScrape(query);
      
      // Extract leads from scraped content (or generate if no content)
      leads = await extractLeadsFromContent(scrapedContent, query, maxResults);
    }

    // If no leads found, generate AI-based leads
    if (leads.length === 0) {
      console.log('No leads scraped, generating AI-based leads');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are a lead generation assistant. Based on the following search query, generate ${maxResults} realistic leads in JSON format.

Query: "${query || 'business professionals'}"

Generate leads with these fields:
- name: Full name
- company: Company name
- role: Job title
- linkedin: LinkedIn URL (use format: linkedin.com/in/username)
- twitter: Twitter handle (use format: @username)
- email: Professional email
- website: Company website (optional)
- score: Lead quality score 1-100
- tags: Array of relevant tags

Return ONLY a valid JSON array of leads, no markdown formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const generatedLeads = JSON.parse(cleanedText);

      leads = generatedLeads.map((lead: Record<string, unknown>) => ({
        id: uuidv4(),
        name: (lead.name as string) || 'Unknown',
        company: lead.company as string,
        role: lead.role as string,
        linkedin: lead.linkedin as string,
        twitter: lead.twitter as string,
        email: lead.email as string,
        website: lead.website as string,
        status: 'new' as const,
        score: typeof lead.score === 'number' ? lead.score : 50,
        signals: [],
        tags: [],
        source: 'ai_generated',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    // If spreadsheetId is provided, add leads to that spreadsheet
    if (spreadsheetId && leads.length > 0) {
      const updated = SpreadsheetStore.addLeads(spreadsheetId, leads);
      if (!updated) {
        return NextResponse.json(
          { success: false, message: 'Spreadsheet not found' },
          { status: 404 }
        );
      }
    }

    const response: ScrapeResponse = {
      success: true,
      leads,
      message: `Found ${leads.length} leads for "${query || url}"`,
      totalFound: leads.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to scrape leads', error: String(error) },
      { status: 500 }
    );
  }
}
