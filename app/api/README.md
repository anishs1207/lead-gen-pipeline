# Lead Generation Pipeline:
- /chat-matrix: updatedData

data => gemini model => updatedData direclty 
(instead add a better add, remove etc based apporach here)

problem with the cureent approach
1. high token usage (since it sends full sheet each time)
2. risky edits (model can acciently ) modify the unrealted rows here
3. no tracaiblity (you can t see what has changed to store in backend also)
4. hard to validate (you must diff the entire dataset here)
5. np guardrials here (as model has idrect access tp the structue of ata)

FLOW:
- intead give it controlleed actions it can do here
{
  "operations": [
    {
      "action": "addRow",
      "data": {
        "name": "Anish",
        "email": "anish@email.com",
        "status": "active"
      }
    },
    {
      "action": "deleteRow",
      "rowId": 3
    },
    {
      "action": "updateRow",
      "rowId": 5,
      "data": {
        "status": "inactive"
      }
    }
  ]
}

etc:
addRow()
deleteRow()
updateRow()

- can give llm sort of tools or apis to call:
Available Operations:

addRow(data)
updateRow(rowId, data)
deleteRow(rowId)
appendColumn(name)
deleteColumn(name)

Ex prompt:
You are a data assistant.

You will receive:
1. Current data
2. User request

You must return ONLY operations.

Allowed operations:

addRow(data)
updateRow(rowId, data)
deleteRow(rowId)

Never return the full dataset.

User Request:
"Remove inactive users and add John with email john@test.com"

Data:
[
 { id:1, name:"Alice", status:"active" },
 { id:2, name:"Bob", status:"inactive" }
]

{
  "operations":[
    {
      "action":"deleteRow",
      "rowId":2
    },
    {
      "action":"addRow",
      "data":{
        "name":"John",
        "email":"john@test.com",
        "status":"active"
      }
    }
  ]
}

// or can use langchain and define them as tool alos (best caSE, MODEL CALLS TOOL INSTEAD OF generating the json here)
- easier rollback, low token usage, versionign i s possible

# final arch:
User Request
     │
     ▼
Fetch relevant data
     │
     ▼
Send to LLM
     │
     ▼
LLM returns operations[]
     │
     ▼
Backend validates operations
     │
     ▼
Execute operations
     │
     ▼
Return updated data



TODO:
- add a section like take data & then have access to
addRow()
deleteRow()
etc stuff like this istead of direct access to it
- 

just is given just data and has to give the final one



it is dat object and it is updates
(direct access to sheets here)
instead of the approach of sending data to llm

# CHAT LEADS SCRAPE: (/chats/leads/scrape)

# POTENTIAL ERROR POINTS:
- reduce chances of hallunictations which are created from llms here & core rule LLM Should NEVER Generate Leads, since right now your system still allows the LLM to invent fields
- instead of rules: llm can only extract text that exists in the source, extract only info explicit;y present in text & if info is missing return null, do not infer or guess
- Instead of asking the LLM for structured leads, ask it for: mentions & entities

# ARCHITECTURE:
1. PARAMS: query, spreadheetId (to identify in the spreadsheet store), maxResults (10 if not spec), url to scrape, names of people/leads
2. SCRAPING:
- need either query or url given (or names of leads also with minial descp)
- if url given scrape that & return in markdown format & scrape content (search the query here) & google search (scraping powered by it also) [RANDOM QUERY BASED SEARCH ON RANDOM WEBPAGES POWERED BY FIRECRAWL]
- or instead of scrpaing raw pages/resources using firecrawl/google search/bong search etc egines form internet & also collected internet crawl info
- add OSINT feature, given a person's name => can search all info abt them, twiiter, linkedin, etc socials here

RESOURCES:
a. Firecrawl Improvement (Instead of scraping whole page: Use: mainContentOnly & Reduces tokens)
- Use strict instruction:
- If data is not explicitly present & DO NOT fill it => Return null.
a. linkedin search pages (site:linkedin.com/in "CTO" "SaaS" "London", site:linkedin.com/in "founder" "AI startup") & return direct leads (linkedin profiles)
b. twitter leads based on thier posts and etc bio & profiles
c. startup directorues (Crunchbase, Product Hunt, AngelList, YC Startup Directory) => list of founders
d. google maps to get bussiness & diff ways to reach out (emails, location, phone number, webiste link)
e. conference speaker pages (goldmine for leads) => "AI conference speakers 2025" & "startup summit speakers" (these pages conatiner: name, role, company, linkedin)
f. podcast guest lists (top sass podctas guests to search) Guests = founders
g. github org maintainers (site:github.com "founder" & site:github.com "CEO"), github based search of leads form open source projects (like search for people buiding in ts/js projects) to search for people in open soruce (skillsynyc yc prohect here)
h. Crunchbase companies & Product Hunt launches
i. use of google operators (
site:linkedin.com/in "founder" "AI startup"
site:linkedin.com/in "CTO" "SaaS"
site:twitter.com "founder @"
site:github.com "CEO"
)
j. to keep on searching it & add auto lead discovery loops.
ex: Find SaaS founders (Recursive enrichment)
→ extract companies
→ search those companies employees
→ find CTOs
4. extract raw candiate names (no emails or canidate info yet)
{
 "candidates":[
  {
   "name":"John Smith",
   "context":"CTO at Acme mentioned in article"
  }
 ]
} 
{
  "candidates": [
    {
      "name": "John Smith",
      "sourceText": "John Smith, CTO of Acme AI, spoke at the summit."
    }
  ]
}
5. lead graph (Instead of treating leads as rows, treat them as a graph of entities.)
- Entities: Person + Company + Website + Social account + Email + Phone

@resume-from-here <>><><>

- use mutlicoe source based scrappng of the dteails
(query → search → scrape 10 pages
query → multiple sources
query = "AI startup founders london")
- 


Relationships:

Person -> works_at -> Company
Person -> twitter -> account
Company -> website -> domain


Founder → Company → Website → Team page → Employees

you can recursively expand.

Example:

Find SaaS founders
→ extract companies
→ visit company site
→ scrape team page
→ find CTO

This is how lead intelligence platforms work.

Source Ranking (VERY Important)
Not all sources are equal.
Rank them.
Example:
High quality:
LinkedIn
Company website
Conference speaker pages
YC / Crunchbase
Podcast guest lists
Lower quality:
random blog posts
scraped aggregator sites
Your pipeline should prioritize:
structured sources first
instead of random Firecrawl pages.

Split Scraping Into Two Phases
Current system mixes everything.
Better approach:
Phase 1 — Discovery
Find candidate people.
Sources:
LinkedIn search
YC directory
Crunchbase
conference pages
Product Hunt
Output:
name
company
context
source
Phase 2 — Enrichment

Now enrich each candidate.

Search:

{name} {company} linkedin
{name} {company} twitter
{name} {company} email

5. if not url given only query (like saas ctos in engad etc) - Search and scrape multiple pages for a query using Firecrawl Search & same extract leds from it
6. Validate with search & enrich (linkedin/email/company) => methods to lead out in a formal manner (socials: email/compnay/webiste/phone number/reddit/inst/fb/twiiter/linkedin)
- for each candiate: "John Smith CTO Acme linkedin"
- Then scrape LinkedIn / company pages & Now extract structured info.
5. Introduce Deterministic Extractors

Not everything should use LLMs.

Use:

Regex
DOM selectors
pattern extraction

Example:

Emails:

[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

LinkedIn:

linkedin.com/in/

Twitter:

twitter.com/

These are 100% reliable.
6. also deduplication layer:
now normalise the linkedin & emials here
use hash -> name + compnay to prevent duplication of them
Multi-Query Expansion (Major Improvement)

When user sends:

AI startup founders london

Your system should generate 10 queries automatically.

Example:

site:linkedin.com/in "founder" "AI"
site:linkedin.com/in "CTO" "AI startup"
site:twitter.com "AI founder"
AI startup founders London
site:crunchbase.com AI startup London
site:producthunt.com AI
AI conference speakers London

This massively increases discovery.

7. Lead Expansion Loops (Growth Hacker Trick)

After discovering leads:

Person → Company

Now expand:

Company → employees
Company → founders
Company → investors

Example:

Acme AI
→ scrape team page
→ scrape linkedin employees
→ find CTO / Head of AI

This multiplies leads.

Better Deduplication

Current:

hash(name + company)

Better:

Use multiple identifiers:

linkedin
email
twitter
domain

Priority:

linkedin > email > name+company
7. Email Discovery Improvements

You currently scrape emails from websites.

Better approach:

Pattern guessing

If domain found:

acme.ai

Generate:

john@acme.ai
john.smith@acme.ai
jsmith@acme.ai

Then verify via SMTP check.

Many outreach tools do this.

7. verification layer:
never trust llm verify using rules,
ex:
linkedin domain must exist
email domain matches company
twitter handle exists
if fial => discard
7. 
7. confidence scoring: instead of llm to haluncate , score using rukes
(more relevant info of reaching out) then more better
+40 linkedin found
+20 company found
+20 role found
+10 twitter
+10 website
8. Save lead (wuth all relevant info here) & save in db (json) & nofuty user in sheets and laso result in relevant response
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
(somtimes hallunctaes and makes up the details also sometimes)

FINAL:
webiste email scrpaing:
if you find compnay site, scrape about /about, /team, /contactthe extract the emails via use of regx
lead qulaity rankibg ()
Founder / CTO → +40
Company website → +20
LinkedIn → +20
Email → +10
Twitter → +10
- async scraping queue: (better ux)
POST /scrape
     ↓
create job
     ↓
worker scrapes
     ↓
notify user
13. much better arch:
User query
     ↓
Search sources
     ↓
Scrape pages
     ↓
Extract candidate names
     ↓
Deduplicate
     ↓
Enrich profiles
     ↓
Verify
     ↓
Score leads
     ↓
Save
{
 "name": "",
 "company": "",
 "role": "",
 "linkedin": "",
 "twitter": "",
 "email": "",
 "website": "",
 "source": "",
 "confidence": 0,
 "tags": []
}
{
 "name": "",
 "company": "",
 "role": "",
 "linkedin": "",
 "twitter": "",
 "email": "",
 "website": "",
 "source": "",
 "confidence": 0,
 "tags": []
}

# TODO: add this:

10. Add Lead Intent Signals

Your leads become more valuable if you track signals.

Examples:

Signals:

recently raised funding
hiring engineers
launched product
speaking at conference
active on twitter

These are high-conversion leads.

11. Smart Source Crawling

Instead of scraping pages randomly:

Use domain focused crawling.

Example:

company.com
→ /team
→ /about
→ /people
→ /leadership
→ /contact

This is where emails are.

12. Parallel Worker Architecture

Your async queue is good.

But optimize like this:

API
↓
create job
↓
queue
↓
workers
   ├ scrape sources
   ├ enrich leads
   ├ verify
   └ score
↓
save leads

Workers should run in parallel.

13. Introduce a Lead Quality Model

Instead of simple scoring, create tiers.

Example:

Tier 1

linkedin + company + email

Tier 2

linkedin + company

Tier 3

name + company

Only save Tier 1 and Tier 2.

14. Track Source Provenance

Every lead must include:

sourceUrl
sourceType
timestamp

Example:

{
 "name": "John Smith",
 "company": "Acme AI",
 "role": "CTO",
 "linkedin": "...",
 "source": "https://aisummit.com/speakers",
 "sourceType": "conference",
 "confidence": 92
}

This helps debugging.

15. OSINT Mode (Great Idea)

Your OSINT feature can work like this:

Input:

name: John Smith
company: Acme

Search:

"John Smith" Acme
"John Smith" linkedin
"John Smith" twitter
"John Smith" github

Then build profile.

16. Add Rate Limits + Source Rotation

Scraping:

linkedin
twitter
google
github

can get blocked.

Use:

proxy rotation
user agent rotation
delays
17. The Single Biggest Upgrade

Add recursive discovery loops.

Example pipeline:

Find AI founders
↓
Extract companies
↓
Find employees of those companies
↓
Find their LinkedIn
↓
Extract emails from domain

This creates 10× more leads.

18. Final Ideal Pipeline
User query
     ↓
Query expansion
     ↓
Source discovery
     ↓
Scrape structured sources
     ↓
Extract candidate people
     ↓
Deduplicate
     ↓
Enrich profiles
     ↓
Verify identities
     ↓
Find emails
     ↓
Score lead
     ↓
Save
     ↓
Notify user
19. One Extremely Powerful Feature You Should Add

Lead lookalikes.

Example:

User finds:

CTO at AI startup

Your system finds similar leads:

Other AI startup CTOs
Other founders in same funding stage
Other companies hiring AI engineers

This is how growth tools scale lead generation.

✅ If you'd like, I can also show you the architecture used by Apollo, Clay, and ZoomInfo for lead generation, which could make your system 10–50× more powerful than basic scraping.



- other apis:
/chat
/signals:
1. on given leads it analalyses it to indictae buying intent
2. give spreadheetId, ledsId, analyseAll (true/false)
3. get spreadhseet from the store & avoid rate liming of max leads
4. on analyse ledds it gives back signals
- type: one of "job_change", "funding", "hiring", "content_engagement", "website_visit", "social_mention"
- description: brief description of the signal
- strength: "low", "medium", or "high"


LEARN AND SEE THESE:
/leads/discover:
1. given query & options (lang, country searchLimit, etc)
2. if not default values are assumed here
3. Generates semantically diverse query variants to maximise URL recall.
4. CONUTNUE IT;


# APIS:
/api/message => the large chat one for syreaming responses (du,y data) - handle seperaley vs the leads pipekine here

see other apis and see which ones ar emosr conervhed with thi and then move ahead here

# How to help bussinesses find leads here for theier paarticluar bsusiness to find cinets:
- google maps (to find bussiness near your applsn here)
- get info (email, linkedin, twitter, instafra,, phone number etc)