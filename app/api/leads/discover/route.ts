/**
 * /api/leads/discover — Stage 1: Multi-Query Discovery Engine
 *
 * Standalone endpoint for the discovery stage of the pipeline.
 * Uses Firecrawl's /search endpoint with multiple query strategies
 * to find pages likely to contain contact information.
 *
 * POST /api/leads/discover
 * Body: { query, options?: { lang?, country?, searchLimit?, strategies? } }
 *
 * Returns: { urls[], searchResults[], queryVariants[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY || '' });

// Typed interface for Firecrawl search result
interface FirecrawlSearchItem {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
}

interface FirecrawlSearchResult {
  success: boolean;
  data?: FirecrawlSearchItem[];
  error?: string;
}

/**
 * Generates semantically diverse query variants to maximise URL recall.
 * Each strategy targets a different source type or contact format.
 */
function buildQueryVariants(query: string): Array<{ strategy: string; query: string }> {
  return [
    // Strategy 1: Direct email search (most valuable — actual emails on pages)
    { strategy: 'email_direct', query: `"${query}" email contact` },
    // Strategy 2: Gmail-specific (catches personal/startup contacts)
    { strategy: 'gmail_search', query: `"${query}" "@gmail.com" OR "@outlook.com"` },
    // Strategy 3: LinkedIn profiles (professional network)
    { strategy: 'linkedin_profiles', query: `${query} site:linkedin.com/in` },
    // Strategy 4: About/team pages (people pages on company sites)
    { strategy: 'team_pages', query: `${query} "meet the team" OR "about us" email` },
    // Strategy 5: Professional directories (industry-specific listings)
    { strategy: 'directories', query: `${query} directory OR roster OR members email` },
    // Strategy 6: Twitter/X bios (social leads)
    { strategy: 'twitter_bios', query: `${query} site:twitter.com OR site:x.com` },
    // Strategy 7: Company domains (find all employees at a company)
    { strategy: 'company_staff', query: `${query} staff OR employees OR founders contact email` },
  ];
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();

  const body = await request.json().catch(() => ({}));
  const {
    query,
    options = {},
  } = body as {
    query?: string;
    options?: {
      lang?: string;
      country?: string;
      searchLimit?: number;
      strategies?: string[];
    };
  };

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return NextResponse.json(
      { success: false, message: 'Query is required (min. 2 characters)' },
      { status: 400 }
    );
  }

  const lang = options.lang || 'en';
  const country = options.country || 'us';
  const limit = Math.min(options.searchLimit ?? 5, 10); // cap at 10 per variant
  const enabledStrategies = options.strategies; // undefined = all

  const variants = buildQueryVariants(query.trim()).filter(
    (v) => !enabledStrategies || enabledStrategies.includes(v.strategy)
  );

  const urlSet = new Set<string>();
  const rawResults: Array<{
    strategy: string;
    query: string;
    urls: string[];
    snippets: Array<{ url: string; title?: string; description?: string }>;
    error?: string;
  }> = [];

  for (const { strategy, query: variantQuery } of variants) {
    try {
      const res = await (firecrawl as unknown as {
        search: (q: string, o: Record<string, unknown>) => Promise<FirecrawlSearchResult>;
      }).search(variantQuery, {
        limit,
        lang,
        country,
        // Ask Firecrawl to also return markdown content for the top 3 results
        // so we can immediately extract emails from search result snippets
        scrapeOptions: { formats: ['markdown'] },
      });

      const urls: string[] = [];
      const snippets: Array<{ url: string; title?: string; description?: string }> = [];

      if (res.success && res.data) {
        for (const item of res.data) {
          if (item.url) {
            urls.push(item.url);
            urlSet.add(item.url);
            snippets.push({
              url: item.url,
              title: item.title,
              description: item.description,
            });
          }
        }
      }

      rawResults.push({ strategy, query: variantQuery, urls, snippets });
    } catch (err) {
      rawResults.push({
        strategy,
        query: variantQuery,
        urls: [],
        snippets: [],
        error: String(err),
      });
    }
  }

  const allUrls = Array.from(urlSet);

  return NextResponse.json({
    success: true,
    totalUrls: allUrls.length,
    urls: allUrls,
    queryVariants: rawResults,
    durationMs: Date.now() - t0,
    message: `Discovery found ${allUrls.length} unique URLs across ${variants.length} search strategies`,
  });
}
