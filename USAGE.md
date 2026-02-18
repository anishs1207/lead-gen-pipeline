# Lead Generation CRM - Usage Guide

This guide provides sample queries you can use with the AI-powered spreadsheet assistant on the `/sheets` page.

---

## 🚀 Getting Started

Navigate to `http://localhost:3000/sheets` to access the Lead Generation CRM with AI chat.

---

## ➕ Adding Leads

### Single Lead
| Query | Expected Behavior |
|-------|-------------------|
| `Add John Smith from Acme Corp` | Creates a new lead with name "John Smith" and company "Acme Corp" with default status "new" and score 50 |
| `Add Jane Doe from TechCo as CTO` | Creates a lead with name, company, and role filled in |
| `Add lead: Bob Wilson, StartupXYZ, bob@startupxyz.com` | Creates a lead parsing name, company, and email from the comma-separated format |
| `Add Sarah Connor from SkyNet as CEO with email sarah@skynet.com and score 85` | Creates a fully detailed lead with all specified fields |

### Bulk Leads
| Query | Expected Behavior |
|-------|-------------------|
| `Add 3 leads: John from CompanyA, Jane from CompanyB, Bob from CompanyC` | Creates 3 separate leads with the specified details |

### Using Quick Add Form
1. Click the **👤** button in the chat header
2. Fill in the form fields (Name is required)
3. Click "Add Lead" to submit

---

## ✏️ Updating Leads

### Single Lead Updates
| Query | Expected Behavior |
|-------|-------------------|
| `Mark John as qualified` | Updates the lead named "John" to status "qualified" |
| `Update Jane's score to 90` | Sets Jane's lead score to 90 |
| `Change Bob's status to contacted` | Updates Bob's status to "contacted" |
| `Update John's email to john.new@acme.com` | Updates the email field for John |
| `Add notes to Sarah: "Met at conference"` | Adds notes to Sarah's lead entry |

### Bulk Updates
| Query | Expected Behavior |
|-------|-------------------|
| `Mark all new leads as contacted` | Updates every lead with status "new" to "contacted" |
| `Update all Acme Corp leads to qualified` | Updates all leads from Acme Corp to status "qualified" |
| `Set score to 75 for all leads from TechCo` | Bulk updates scores for all TechCo leads |

### Valid Status Values
- `new` - Newly added lead
- `contacted` - Initial outreach made
- `replied` - Lead has responded
- `qualified` - Lead is verified as a good fit
- `closed` - Deal won/completed
- `lost` - Deal lost or lead disqualified

---

## 🗑️ Deleting Leads

| Query | Expected Behavior |
|-------|-------------------|
| `Delete John Smith` | Removes the lead named John Smith |
| `Remove all lost leads` | Deletes all leads with status "lost" |
| `Delete leads with score below 30` | Removes all low-scoring leads |
| `Remove all leads from CompanyX` | Deletes all leads associated with CompanyX |

---

## 🔍 Searching & Filtering

### Basic Filters
| Query | Expected Behavior |
|-------|-------------------|
| `Show me all qualified leads` | Filters to display only qualified leads |
| `Filter leads with score > 80` | Shows only high-scoring leads |
| `Show new leads` | Displays only leads with "new" status |
| `Find leads from tech companies` | Searches for leads with "tech" in company name |

### Advanced Filters
| Query | Expected Behavior |
|-------|-------------------|
| `Show qualified leads with score above 70` | Combines status and score filters |
| `Find leads from Google or Microsoft` | Searches for leads from either company |
| `Show leads without email` | Filters to leads missing email field |

---

## 📊 Sorting

| Query | Expected Behavior |
|-------|-------------------|
| `Sort by score descending` | Orders leads from highest to lowest score |
| `Sort by name alphabetically` | Orders leads A-Z by name |
| `Sort by company` | Orders leads by company name (A-Z) |
| `Sort by score ascending` | Orders leads from lowest to highest score |
| `Order by status` | Groups leads by their status |

---

## 📈 Data Analysis

| Query | Expected Behavior |
|-------|-------------------|
| `What's the average lead score?` | Calculates and displays the average score across all leads |
| `How many qualified leads do we have?` | Counts leads with "qualified" status |
| `Who has the highest score?` | Identifies the top-scoring lead |
| `Show me a summary of leads by status` | Provides a breakdown of lead counts by status |
| `How many leads are from Acme Corp?` | Counts leads from a specific company |
| `What percentage of leads are qualified?` | Calculates qualified leads as a percentage |

---

## 🌐 Web Scraping

### Using the Scrape Button
1. Click the **🌍** button in the chat header
2. Enter a URL (company website, LinkedIn page, etc.)
3. Click the ⚡ button to start scraping
4. Leads will be extracted and added to your spreadsheet

### Scrape Queries
| Query | Expected Behavior |
|-------|-------------------|
| `Find AI startup founders` | Searches and generates leads matching the query |
| `Find SaaS company executives` | Generates relevant leads based on the search term |

---

## 🔧 Column Management

The AI can also manage spreadsheet columns:

| Query | Expected Behavior |
|-------|-------------------|
| `Add a column called Priority` | Adds a new text column named "Priority" to the spreadsheet |
| `Add a Notes column` | Adds a new "Notes" column |
| `Remove the Priority column` | Deletes the Priority column from the spreadsheet |

---

## 💡 Tips & Best Practices

### Effective Queries
- Be specific: `"Add John Smith from Acme Corp as Sales Director"` works better than `"Add John"`
- Use full names when updating/deleting to avoid ambiguity
- Combine actions: `"Mark John as qualified and update his score to 85"`

### Quick Actions
The chat interface shows quick suggestion buttons at the start. Click any to auto-fill the query.

### Keyboard Shortcuts
- **Enter** - Send message
- **Shift + Enter** - New line in message

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Lead not found for update/delete | Check the exact name spelling in the spreadsheet |
| Score not updating | Ensure you're using a number between 0-100 |
| Status not changing | Use valid status values: new, contacted, replied, qualified, closed, lost |
| Chat not responding | Check if the API key is configured in `.env` file |

---

## 📋 Example Workflow

Here's a typical workflow for managing leads:

```
1. "Add John Smith from Acme Corp as Sales Director"
   → Creates new lead

2. "Update John's email to john@acme.com"
   → Adds contact information

3. "Mark John as contacted"
   → Updates status after reaching out

4. "Update John's score to 75"
   → Adjusts lead score based on interaction

5. "Show all qualified leads sorted by score"
   → Reviews best leads for follow-up

6. "What's the average score of qualified leads?"
   → Analyzes lead quality
```

---

## 🎯 Command Reference

| Action | Keywords | Example |
|--------|----------|---------|
| Add | add, create, new | `Add John from Acme` |
| Update | update, change, mark, set | `Mark John as qualified` |
| Delete | delete, remove, drop | `Delete all lost leads` |
| Filter | show, filter, find, display | `Show qualified leads` |
| Sort | sort, order, arrange | `Sort by score desc` |
| Analyze | what, how many, average, count | `What's the average score?` |
| Search | search, find, look for | `Search for John` |
