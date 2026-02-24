import { NextRequest } from 'next/server';

export const maxDuration = 30;

// — Dummy reasoning step sets —
const DUMMY_REASONING_SETS = [
  [
    { icon: 'search', label: 'Searching the web for relevant company data...' },
    { icon: 'analyze', label: 'Analyzing lead profiles and signals...' },
    { icon: 'filter', label: 'Filtering by ICP criteria (company size, industry)...' },
    { icon: 'rank', label: 'Ranking leads by conversion probability...' },
  ],
  [
    { icon: 'search', label: 'Querying CRM for matching contacts...' },
    { icon: 'analyze', label: 'Cross-referencing with LinkedIn data...' },
    { icon: 'filter', label: 'Applying intent signal filters...' },
    { icon: 'rank', label: 'Generating outreach recommendations...' },
  ],
  [
    { icon: 'search', label: 'Scraping public company information...' },
    { icon: 'analyze', label: 'Identifying decision makers...' },
    { icon: 'filter', label: 'Checking for recent funding events...' },
    { icon: 'rank', label: 'Building priority lead list...' },
  ],
];

// — Dummy response bodies —
const DUMMY_RESPONSES = [
  `# Lead Generation Analysis

Based on your query, here's what I found across the market:

## Key Findings

- **Top segment:** SaaS companies with 50–500 employees showing strong buying signals.
- **Best channel:** LinkedIn outreach has a **3.2× higher** reply rate than cold email for this segment.
- **Timing matters:** Reaching out within **24 hours** of a funding announcement increases reply rates by 67%.

## Recommended Outreach Sequence

1. Connect on LinkedIn with a personalized note referencing their recent news.
2. Follow up with a short email (3 sentences max) after 3 days.
3. Drop a voicemail on day 7 if no response.

> **Pro tip:** Companies that just raised a Series A are 4× more likely to buy new sales tools in the next 90 days.`,

  `# Market Intelligence Report

I've scanned the available data and here's the summary:

## Segment Performance

\`\`\`
Segment A (Series A SaaS):     +34% response rate
Segment B (SMB Fintech):       +21% response rate  
Segment C (Enterprise Legacy):  -8% response rate
\`\`\`

## High-Intent Signals to Watch

- Job postings for "Head of Sales" or "VP of Revenue" → company is scaling.
- G2 review activity spike → evaluating new vendors.
- Recent press mentions → good conversation starter.

Check the sources below for detailed industry benchmarks and case studies.`,

  `# Prospecting Insights

Your **Ideal Customer Profile (ICP)** analysis is complete:

## ICP Match Criteria

| Attribute | Value |
|---|---|
| Company Size | 50–500 employees |
| Industry | SaaS / B2B Tech |
| Role | VP Sales, Head of Growth |
| Pain Point | Insufficient qualified pipeline |
| Tech Stack | Salesforce or HubSpot |

## Next Actions

1. Build a list of 50 companies matching this profile in Apollo.io.
2. Enrich with LinkedIn data to identify warm connections.
3. Draft 3 personalized opening lines per persona type.

I've also pulled the most relevant sources for you below.`,
];

// — Dummy sources —
const DUMMY_SOURCES = [
  [
    { url: 'https://www.hubspot.com/sales-statistics', title: 'HubSpot Sales Stats 2024' },
    { url: 'https://www.gartner.com/en/sales', title: 'Gartner Sales Insights' },
    { url: 'https://linkedin.com/business/sales', title: 'LinkedIn Sales Solutions' },
  ],
  [
    { url: 'https://www.g2.com/categories/crm', title: 'G2 CRM Reviews' },
    { url: 'https://techcrunch.com/tag/sales-tech/', title: 'TechCrunch — Sales Tech' },
    { url: 'https://www.mckinsey.com/capabilities/growth-marketing-and-sales', title: 'McKinsey Sales Insights' },
    { url: 'https://apollo.io/blog', title: 'Apollo.io Blog' },
  ],
  [
    { url: 'https://clearbit.com/blog', title: 'Clearbit Prospecting Guide' },
    { url: 'https://www.salesforce.com/blog/', title: 'Salesforce Blog' },
    { url: 'https://www.forrester.com/research/sales/', title: 'Forrester Sales Research' },
  ],
];

// — Dummy follow-up suggestions (context-aware sets) —
const DUMMY_SUGGESTIONS = [
  [
    'Find me the top 10 SaaS leads matching this ICP',
    'Draft an outreach email for the Series A segment',
    'Show me companies that just posted Sales leadership jobs',
  ],
  [
    'Which leads have the highest intent score right now?',
    'Build a 5-step outreach sequence for fintech prospects',
    'What are the top objections for this segment?',
  ],
  [
    'Export this lead list to my CRM',
    'Find more companies in the Salesforce ecosystem',
    'Analyze my top 3 competitors\' customer base',
  ],
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    const lastUserMessage = messages?.findLast((m: any) => m.role === 'user');
    const userText: string =
      lastUserMessage?.parts?.find((p: any) => p.type === 'text')?.text ||
      lastUserMessage?.content ||
      'your question';

    // Pick a consistent random index so reasoning/response/suggestions feel coherent
    const idx = Math.floor(Math.random() * DUMMY_RESPONSES.length);
    const reasoningSteps = DUMMY_REASONING_SETS[idx];
    const responseText = DUMMY_RESPONSES[idx];
    const sources = DUMMY_SOURCES[idx];
    const suggestions = DUMMY_SUGGESTIONS[idx];

    const messageId = crypto.randomUUID();
    const textId = crypto.randomUUID();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // AI SDK v6 SSE format: `data: <JSON>\n\n` per chunk
        const send = (chunk: object) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          );
        };

        // 1. Open message envelope
        send({ type: 'start', messageId });
        send({ type: 'start-step' });

        // 2. Stream reasoning steps live — one every ~600ms
        //    Using AI SDK v6 `data-*` custom chunk type. Each step gets a stable `id`
        //    so the SDK can deduplicate/update it in message.parts when marking done.
        for (let i = 0; i < reasoningSteps.length; i++) {
          await sleep(500 + Math.random() * 300);
          send({
            type: 'data-reasoning-step',
            id: `step-${i}`,       // stable id — SDK matches by type+id to update in-place
            data: {
              index: i,
              icon: reasoningSteps[i].icon,
              label: reasoningSteps[i].label,
              done: false,
            },
          });
        }

        // Mark ALL steps as done (update each in-place via their ids)
        await sleep(300);
        for (let i = 0; i < reasoningSteps.length; i++) {
          send({
            type: 'data-reasoning-step',
            id: `step-${i}`,
            data: {
              index: i,
              icon: reasoningSteps[i].icon,
              label: reasoningSteps[i].label,
              done: true,
            },
          });
        }

        // Small pause before content starts
        await sleep(200);

        // 3. Sources
        for (const source of sources) {
          send({
            type: 'source-url',
            sourceId: crypto.randomUUID(),
            url: source.url,
            title: source.title,
          });
        }

        // 4. Stream text word-by-word
        send({ type: 'text-start', id: textId });
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const delta = (i === 0 ? '' : ' ') + words[i];
          send({ type: 'text-delta', id: textId, delta });
          await sleep(12 + Math.random() * 20);
        }
        send({ type: 'text-end', id: textId });

        // 5. Send follow-up suggestions as a custom data chunk
        send({
          type: 'data-suggestions',
          data: { suggestions },
        });

        // 6. Close
        send({ type: 'finish-step' });
        send({ type: 'finish', finishReason: 'stop' });
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'x-vercel-ai-ui-message-stream': 'v1',
        'x-accel-buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
