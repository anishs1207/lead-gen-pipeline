# Lead Generation & CRM System

## Overview
An AI-powered lead generation platform that uses web scraping to find potential leads and manages them in an interactive spreadsheet UI with chat capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Chat Panel  │  │   Spreadsheet    │  │  Sidebar with    │  │
│  │  (AI Chat)   │←→│   (Lead Data)    │←→│  Instances Mgmt  │  │
│  └──────────────┘  └──────────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js API Routes (Serverless)                │
├─────────────────────────────────────────────────────────────────┤
│  /api/leads/scrape   - Web scraping for leads                    │
│  /api/leads/search   - Search/filter leads                       │
│  /api/spreadsheets   - CRUD for spreadsheet instances            │
│  /api/chat           - AI chat with spreadsheet data             │
│  /api/signals        - Customer signal detection                 │
│  /api/export         - Export to Excel                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
├─────────────────────────────────────────────────────────────────┤
│  Firecrawl API  │  Google Gemini AI  │  Web Scraping APIs       │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 1. Lead Generation (Web Scraping)
- **Input**: User provides a query like "Find leads for XYZ project"
- **Process**: 
  1. AI parses the query to understand the target industry/niche
  2. Web scraper (Firecrawl/OpenCrawl) searches for relevant companies/individuals
  3. Extracts contact info: LinkedIn, Twitter, Email, Website
- **Output**: Leads added to spreadsheet with structured data

### 2. Spreadsheet Management
- **Multiple Instances**: Create/switch between different lead spreadsheets
- **Dynamic Columns**: Add custom columns (Name, Company, LinkedIn, Twitter, Email, Status, Score, etc.)
- **Tagged Badges**: Visual badges for status, role, score, and custom tags
- **Row/Column Operations**: 
  - Add new row
  - Add new column
  - Delete row/column
  - Reorder columns

### 3. Chat with Spreadsheet
- **Natural Language Queries**: "Show me all verified leads", "Update status of John to contacted"
- **AI-Powered**: Uses Gemini to understand and execute spreadsheet operations
- **Context-Aware**: AI has access to current spreadsheet data

### 4. Customer Signal Detection
- **Automatic Analysis**: Monitors leads for buying signals
- **Signal Types**:
  - Job changes (potential decision maker)
  - Company growth (funding, hiring)
  - Content engagement (likes, comments on relevant topics)
  - Website activity patterns
- **Scoring**: Assigns priority scores based on signals

### 5. Export Functionality
- **Excel Export**: Download spreadsheet as .xlsx file
- **CSV Export**: Alternative format
- **Filtered Export**: Export only selected/filtered leads

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Components**: Radix UI, shadcn/ui
- **Spreadsheet**: react-spreadsheet
- **Styling**: TailwindCSS 4

### Backend (Serverless)
- **Runtime**: Next.js API Routes
- **AI**: Google Gemini API (@google/generative-ai)
- **Web Scraping**: Firecrawl API (or custom scraping)
- **Data Format**: JSON (in-memory for MVP, can add DB later)

### External APIs
- **Firecrawl**: Web crawling and scraping
- **Google Gemini**: AI chat and query understanding
- **Excel Export**: xlsx library

## API Endpoints

### `POST /api/leads/scrape`
Request:
```json
{
  "query": "Find leads for AI startups in healthcare",
  "spreadsheetId": "uuid",
  "maxResults": 20
}
```
Response:
```json
{
  "success": true,
  "leads": [
    {
      "name": "John Doe",
      "company": "HealthAI Inc",
      "linkedin": "linkedin.com/in/johndoe",
      "twitter": "@johndoe",
      "email": "john@healthai.com",
      "status": "new",
      "signals": ["recent_funding", "hiring"]
    }
  ],
  "message": "Found 15 leads for AI startups in healthcare"
}
```

### `POST /api/chat`
Request:
```json
{
  "message": "Show me all leads with high scores",
  "spreadsheetId": "uuid",
  "context": { /* current spreadsheet data */ }
}
```
Response:
```json
{
  "response": "Found 5 leads with scores above 80...",
  "action": {
    "type": "filter",
    "criteria": { "score": { "gte": 80 } }
  }
}
```

### `GET /api/spreadsheets`
Lists all spreadsheet instances

### `POST /api/spreadsheets`
Creates new spreadsheet instance

### `POST /api/export`
Exports spreadsheet to Excel format

## Component Structure

```
components/
├── dashboard/
│   ├── ChatApp.tsx         - Main app container
│   ├── ChatContent.tsx     - AI chat interface
│   ├── LeadSheet.tsx       - Enhanced spreadsheet component
│   ├── SheetToolbar.tsx    - Spreadsheet controls
│   ├── SheetInstances.tsx  - Manage multiple spreadsheets
│   └── SignalBadge.tsx     - Signal indicator badges
└── ui/
    └── ... (existing UI components)
```

## Data Models

### Lead
```typescript
interface Lead {
  id: string;
  name: string;
  company?: string;
  role?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  website?: string;
  status: 'new' | 'contacted' | 'replied' | 'qualified' | 'closed';
  score: number;
  signals: Signal[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Spreadsheet Instance
```typescript
interface SpreadsheetInstance {
  id: string;
  name: string;
  columns: Column[];
  leads: Lead[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Signal
```typescript
interface Signal {
  type: 'job_change' | 'funding' | 'hiring' | 'content_engagement' | 'website_visit';
  description: string;
  strength: 'low' | 'medium' | 'high';
  detectedAt: Date;
}
```

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

## Development Roadmap

### Phase 1: Core Features ✅
- [x] Basic spreadsheet with badge display
- [ ] Lead scraping API endpoint
- [ ] Multiple spreadsheet instances
- [ ] Add/remove rows and columns

### Phase 2: AI Integration
- [ ] Chat with spreadsheet
- [ ] Natural language queries
- [ ] AI-powered lead scoring

### Phase 3: Signal Detection
- [ ] Customer signal detection
- [ ] Signal badge display
- [ ] Priority scoring based on signals

### Phase 4: Export & Polish
- [ ] Excel export
- [ ] CSV export
- [ ] UI polish and optimizations

## Usage Examples

### Find Leads
```
User: "Find me leads for SaaS companies in fintech space"
AI: Searching for fintech SaaS companies...
    Found 12 leads. Adding to spreadsheet:
    - Jane Smith (CFO, PayTech) - LinkedIn, Email
    - Bob Johnson (CTO, FinSoft) - Twitter, LinkedIn
    ...
```

### Chat with Spreadsheet
```
User: "Update all leads with score < 50 to 'low priority'"
AI: Updated 3 leads to 'low priority' status.

User: "Show me leads from companies that recently raised funding"
AI: Found 2 leads with recent funding signals:
    - HealthAI Inc (Series A, $5M)
    - TechStart Corp (Seed, $1M)
```

### Export
```
User: "Download this spreadsheet as Excel"
AI: [Downloads leads_2024_02_08.xlsx]
```