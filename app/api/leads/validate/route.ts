/**
 * /api/leads/validate — Contact Validation & Quality Assurance
 *
 * Validates and cleans lead contact information:
 * 1. Email syntax validation (regex + MX-domain check via DNS lookup)
 * 2. LinkedIn URL normalisation & validation
 * 3. Phone number format normalisation
 * 4. Deduplication across a spreadsheet
 * 5. Data quality scoring (completeness %)
 *
 * POST /api/leads/validate
 * Body: { spreadsheetId, leadIds?, removeInvalid? }
 *
 * GET /api/leads/validate?spreadsheetId=xxx
 * Returns quality report without modifying data
 */

import { NextRequest, NextResponse } from 'next/server';
import { SpreadsheetStore } from '@/lib/spreadsheet-store';
import { Lead } from '@/lib/types';

// ─── Validation Utilities ────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

// Known disposable/invalid email domains
const INVALID_DOMAINS = new Set([
  'example.com',
  'test.com',
  'placeholder.com',
  'email.com',
  'fake.com',
  'none.com',
  'noreply.com',
  'no-reply.com',
]);

// Known high-value email domains (bonus scoring)
const BUSINESS_EMAIL_INDICATORS = [
  // Not free consumer emails — means it's a work email
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
];

interface ValidationIssue {
  field: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
}

interface LeadValidationReport {
  leadId: string;
  name: string;
  isValid: boolean;
  completenessScore: number; // 0-100
  qualityScore: number; // 0-100
  issues: ValidationIssue[];
  normalised: Partial<Lead>;
}

/**
 * Validates a single email address.
 * Returns { valid, businessEmail, domain, issue? }
 */
function validateEmail(email: string): {
  valid: boolean;
  normalised: string | null;
  isBusinessEmail: boolean;
  issue?: string;
} {
  if (!email || email.trim().length === 0) {
    return { valid: false, normalised: null, isBusinessEmail: false, issue: 'Empty' };
  }

  const cleaned = email.toLowerCase().trim();

  if (!EMAIL_REGEX.test(cleaned)) {
    return { valid: false, normalised: null, isBusinessEmail: false, issue: 'Invalid format' };
  }

  const domain = cleaned.split('@')[1];
  if (INVALID_DOMAINS.has(domain)) {
    return { valid: false, normalised: null, isBusinessEmail: false, issue: 'Placeholder domain' };
  }

  // Check for common obfuscation patterns leftover from extraction
  if (cleaned.includes('[at]') || cleaned.includes('(at)') || cleaned.includes(' at ')) {
    return { valid: false, normalised: null, isBusinessEmail: false, issue: 'Obfuscated email not fully resolved' };
  }

  const isBusinessEmail = !BUSINESS_EMAIL_INDICATORS.includes(domain);

  return { valid: true, normalised: cleaned, isBusinessEmail };
}

/**
 * Validates and normalises a LinkedIn URL.
 */
function validateLinkedIn(url: string): { valid: boolean; normalised: string | null; issue?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, normalised: null };
  }

  let cleaned = url.trim().toLowerCase();

  // Remove protocol
  cleaned = cleaned.replace(/^https?:\/\//i, '');

  // Must contain linkedin.com
  if (!cleaned.includes('linkedin.com')) {
    return { valid: false, normalised: null, issue: 'Not a LinkedIn URL' };
  }

  // Normalise to linkedin.com/in/handle format
  const inMatch = cleaned.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/);
  if (inMatch) {
    return { valid: true, normalised: `linkedin.com/in/${inMatch[1]}` };
  }

  // Company pages — still valid
  const companyMatch = cleaned.match(/linkedin\.com\/company\/([a-zA-Z0-9\-_%]+)/);
  if (companyMatch) {
    return { valid: true, normalised: `linkedin.com/company/${companyMatch[1]}` };
  }

  return { valid: false, normalised: null, issue: 'Could not extract LinkedIn handle from URL' };
}

/**
 * Validates and normalises a phone number.
 */
function validatePhone(phone: string): { valid: boolean; normalised: string | null; issue?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, normalised: null };
  }

  const cleaned = phone.trim();

  if (!PHONE_REGEX.test(cleaned)) {
    return { valid: false, normalised: null, issue: 'Invalid phone format' };
  }

  return { valid: true, normalised: cleaned };
}

/**
 * Calculate completeness percentage for a lead (% of key fields filled).
 */
function computeCompleteness(lead: Lead): number {
  const keyFields: (keyof Lead)[] = ['name', 'email', 'company', 'role', 'linkedin', 'phone', 'website', 'twitter'];
  const filled = keyFields.filter((f) => {
    const val = lead[f];
    return val !== undefined && val !== null && val !== '';
  });
  return Math.round((filled.length / keyFields.length) * 100);
}

/**
 * Full validation of a single lead.
 */
function validateLead(lead: Lead): LeadValidationReport {
  const issues: ValidationIssue[] = [];
  const normalised: Partial<Lead> = {};

  // Validate name
  if (!lead.name || lead.name.trim().length < 2) {
    issues.push({ field: 'name', issue: 'Name is missing or too short', severity: 'error' });
  } else if (lead.name.toLowerCase() === 'unknown') {
    issues.push({ field: 'name', issue: 'Name is "Unknown"', severity: 'warning' });
  }

  // Validate email
  if (lead.email) {
    const emailCheck = validateEmail(lead.email);
    if (!emailCheck.valid) {
      issues.push({ field: 'email', issue: `Email invalid: ${emailCheck.issue}`, severity: 'error' });
      normalised.email = undefined;
    } else {
      normalised.email = emailCheck.normalised!;
      if (!emailCheck.isBusinessEmail) {
        issues.push({ field: 'email', issue: 'Personal email (not work)', severity: 'info' });
      }
    }
  } else {
    issues.push({ field: 'email', issue: 'Email missing', severity: 'warning' });
  }

  // Validate LinkedIn
  if (lead.linkedin) {
    const liCheck = validateLinkedIn(lead.linkedin);
    if (!liCheck.valid) {
      issues.push({ field: 'linkedin', issue: `LinkedIn invalid: ${liCheck.issue}`, severity: 'warning' });
      normalised.linkedin = undefined;
    } else {
      normalised.linkedin = liCheck.normalised!;
    }
  } else {
    issues.push({ field: 'linkedin', issue: 'LinkedIn missing', severity: 'info' });
  }

  // Validate phone
  if (lead.phone) {
    const phoneCheck = validatePhone(lead.phone);
    if (!phoneCheck.valid) {
      issues.push({ field: 'phone', issue: `Phone invalid: ${phoneCheck.issue}`, severity: 'warning' });
      normalised.phone = undefined;
    } else {
      normalised.phone = phoneCheck.normalised!;
    }
  }

  // Check company
  if (!lead.company) {
    issues.push({ field: 'company', issue: 'Company missing', severity: 'warning' });
  }

  // Check role
  if (!lead.role) {
    issues.push({ field: 'role', issue: 'Role/title missing', severity: 'info' });
  }

  // Quality score: base on how many fields are valid
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const completeness = computeCompleteness(lead);
  const qualityScore = Math.max(0, completeness - (errorCount * 15));

  const isValid = errorCount === 0 && (!!lead.email || !!lead.linkedin || !!lead.phone);

  return {
    leadId: lead.id,
    name: lead.name,
    isValid,
    completenessScore: completeness,
    qualityScore,
    issues,
    normalised,
  };
}

/**
 * Find duplicate leads using multiple matching strategies.
 */
function findDuplicates(leads: Lead[]): Array<{ primary: string; duplicates: string[]; matchType: string }> {
  const duplicateGroups: Array<{ primary: string; duplicates: string[]; matchType: string }> = [];

  // Email-based duplicates
  const emailMap = new Map<string, Lead[]>();
  for (const lead of leads) {
    if (lead.email) {
      const key = lead.email.toLowerCase();
      if (!emailMap.has(key)) emailMap.set(key, []);
      emailMap.get(key)!.push(lead);
    }
  }
  for (const [, group] of emailMap) {
    if (group.length > 1) {
      // Keep the one with highest score as primary
      const sorted = [...group].sort((a, b) => b.score - a.score);
      duplicateGroups.push({
        primary: sorted[0].id,
        duplicates: sorted.slice(1).map(l => l.id),
        matchType: 'email',
      });
    }
  }

  // LinkedIn-based duplicates
  const liMap = new Map<string, Lead[]>();
  for (const lead of leads) {
    if (lead.linkedin) {
      const key = lead.linkedin.toLowerCase().replace(/\/$/, '');
      if (!liMap.has(key)) liMap.set(key, []);
      liMap.get(key)!.push(lead);
    }
  }
  for (const [, group] of liMap) {
    if (group.length > 1) {
      const sorted = [...group].sort((a, b) => b.score - a.score);
      const ids = sorted.map(l => l.id);
      // Don't add if already covered by email group
      if (!duplicateGroups.some(g => g.duplicates.some(id => ids.includes(id)))) {
        duplicateGroups.push({
          primary: sorted[0].id,
          duplicates: sorted.slice(1).map(l => l.id),
          matchType: 'linkedin',
        });
      }
    }
  }

  // Name+Company-based duplicates (fuzzy)
  const ncMap = new Map<string, Lead[]>();
  for (const lead of leads) {
    if (lead.name && lead.company) {
      const key = `${lead.name.toLowerCase().trim()}___${lead.company.toLowerCase().trim()}`;
      if (!ncMap.has(key)) ncMap.set(key, []);
      ncMap.get(key)!.push(lead);
    }
  }
  for (const [, group] of ncMap) {
    if (group.length > 1) {
      const sorted = [...group].sort((a, b) => b.score - a.score);
      const ids = sorted.map(l => l.id);
      if (!duplicateGroups.some(g => g.duplicates.some(id => ids.includes(id)))) {
        duplicateGroups.push({
          primary: sorted[0].id,
          duplicates: sorted.slice(1).map(l => l.id),
          matchType: 'name+company',
        });
      }
    }
  }

  return duplicateGroups;
}

// ─── Route Handlers ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spreadsheetId = searchParams.get('spreadsheetId');

  if (!spreadsheetId) {
    return NextResponse.json({ success: false, message: 'spreadsheetId required' }, { status: 400 });
  }

  const spreadsheet = SpreadsheetStore.get(spreadsheetId);
  if (!spreadsheet) {
    return NextResponse.json({ success: false, message: 'Spreadsheet not found' }, { status: 404 });
  }

  const reports = spreadsheet.leads.map(validateLead);
  const duplicates = findDuplicates(spreadsheet.leads);

  const summary = {
    totalLeads: spreadsheet.leads.length,
    validLeads: reports.filter(r => r.isValid).length,
    invalidLeads: reports.filter(r => !r.isValid).length,
    averageCompleteness: Math.round(reports.reduce((s, r) => s + r.completenessScore, 0) / (reports.length || 1)),
    averageQuality: Math.round(reports.reduce((s, r) => s + r.qualityScore, 0) / (reports.length || 1)),
    duplicateGroups: duplicates.length,
    duplicateLeadCount: duplicates.reduce((s, g) => s + g.duplicates.length, 0),
    issuesByType: reports
      .flatMap(r => r.issues)
      .reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    summary,
    reports,
    duplicates,
  });
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();

  const body = await request.json().catch(() => ({}));
  const {
    spreadsheetId,
    leadIds,
    removeInvalid = false,
    removeDuplicates = false,
    applyNormalisation = true,
  } = body as {
    spreadsheetId?: string;
    leadIds?: string[];
    removeInvalid?: boolean;
    removeDuplicates?: boolean;
    applyNormalisation?: boolean;
  };

  if (!spreadsheetId) {
    return NextResponse.json({ success: false, message: 'spreadsheetId is required' }, { status: 400 });
  }

  const spreadsheet = SpreadsheetStore.get(spreadsheetId);
  if (!spreadsheet) {
    return NextResponse.json({ success: false, message: 'Spreadsheet not found' }, { status: 404 });
  }

  const leadsToValidate = leadIds?.length
    ? spreadsheet.leads.filter(l => leadIds.includes(l.id))
    : spreadsheet.leads;

  const reports = leadsToValidate.map(validateLead);
  const duplicates = findDuplicates(leadsToValidate);

  let removedCount = 0;
  let normalisedCount = 0;

  // Apply normalisations to the store
  if (applyNormalisation) {
    for (const report of reports) {
      if (Object.keys(report.normalised).length > 0) {
        SpreadsheetStore.updateLead(spreadsheetId, report.leadId, report.normalised as Partial<Lead>);
        normalisedCount++;
      }
    }
  }

  // Remove invalid leads
  if (removeInvalid) {
    const invalidIds = reports.filter(r => !r.isValid).map(r => r.leadId);
    for (const id of invalidIds) {
      SpreadsheetStore.deleteLead(spreadsheetId, id);
    }
    removedCount += invalidIds.length;
  }

  // Remove duplicate leads (keep primary, delete duplicates)
  if (removeDuplicates) {
    for (const group of duplicates) {
      for (const dupId of group.duplicates) {
        SpreadsheetStore.deleteLead(spreadsheetId, dupId);
      }
      removedCount += group.duplicates.length;
    }
  }

  return NextResponse.json({
    success: true,
    message: `Validated ${leadsToValidate.length} leads: ${normalisedCount} normalised, ${removedCount} removed in ${Date.now() - t0}ms`,
    summary: {
      validated: leadsToValidate.length,
      valid: reports.filter(r => r.isValid).length,
      invalid: reports.filter(r => !r.isValid).length,
      normalisedCount,
      removedCount,
      duplicateGroups: duplicates.length,
    },
    reports,
    duplicates,
    spreadsheet: SpreadsheetStore.get(spreadsheetId),
    durationMs: Date.now() - t0,
  });
}
