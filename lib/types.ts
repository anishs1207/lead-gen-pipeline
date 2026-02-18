// Lead Generation System Types

export type LeadStatus = 'new' | 'contacted' | 'replied' | 'qualified' | 'closed' | 'lost';

export type SignalType = 'job_change' | 'funding' | 'hiring' | 'content_engagement' | 'website_visit' | 'social_mention';

export type SignalStrength = 'low' | 'medium' | 'high';

export interface Signal {
  id: string;
  type: SignalType;
  description: string;
  strength: SignalStrength;
  detectedAt: Date;
  source?: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  role?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  website?: string;
  phone?: string;
  status: LeadStatus;
  score: number;
  signals: Signal[];
  tags: string[];
  notes?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'badge' | 'score' | 'link' | 'tags' | 'signals' | 'action';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}

export interface SpreadsheetInstance {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  leads: Lead[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrapeRequest {
  query: string;
  spreadsheetId: string;
  maxResults?: number;
  sources?: ('linkedin' | 'twitter' | 'web')[];
}

export interface ScrapeResponse {
  success: boolean;
  leads: Lead[];
  message: string;
  totalFound: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: ChatAction;
}

export interface ChatAction {
  type: 'filter' | 'update' | 'add' | 'delete' | 'sort' | 'export' | 'search' | 'analyze' | 'none' | 'addColumn' | 'deleteColumn';
  data?: Record<string, unknown>;
  affectedRows?: string[];
}

export interface ChatRequest {
  message: string;
  spreadsheetId: string;
  spreadsheetData: SpreadsheetInstance;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  action?: ChatAction;
  updatedData?: Partial<SpreadsheetInstance>;
}

export interface ExportRequest {
  spreadsheetId: string;
  format: 'xlsx' | 'csv';
  filters?: Record<string, unknown>;
  selectedRows?: string[];
}

// Badge configuration types
export interface BadgeConfig {
  color: string;
  textColor?: string;
  label: string;
  icon?: string;
}

export interface StatusBadgeConfig extends BadgeConfig {
  status: LeadStatus;
}

export interface SignalBadgeConfig extends BadgeConfig {
  signalType: SignalType;
}

// Default configurations
export const DEFAULT_COLUMNS: Column[] = [
  { id: 'name', key: 'name', label: 'Name', type: 'text', sortable: true, filterable: true },
  { id: 'company', key: 'company', label: 'Company', type: 'text', sortable: true, filterable: true },
  { id: 'role', key: 'role', label: 'Role', type: 'badge', sortable: true },
  { id: 'linkedin', key: 'linkedin', label: 'LinkedIn', type: 'link' },
  { id: 'twitter', key: 'twitter', label: 'Twitter', type: 'link' },
  { id: 'email', key: 'email', label: 'Email', type: 'link' },
  { id: 'status', key: 'status', label: 'Status', type: 'badge', sortable: true, filterable: true },
  { id: 'score', key: 'score', label: 'Score', type: 'score', sortable: true },
  { id: 'signals', key: 'signals', label: 'Signals', type: 'signals' },
  { id: 'tags', key: 'tags', label: 'Tags', type: 'tags' },
];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-amber-500',
  replied: 'bg-cyan-500',
  qualified: 'bg-emerald-500',
  closed: 'bg-green-600',
  lost: 'bg-gray-500',
};

export const SIGNAL_COLORS: Record<SignalType, string> = {
  job_change: 'bg-purple-500',
  funding: 'bg-emerald-500',
  hiring: 'bg-blue-500',
  content_engagement: 'bg-pink-500',
  website_visit: 'bg-orange-500',
  social_mention: 'bg-cyan-500',
};

export const SIGNAL_ICONS: Record<SignalType, string> = {
  job_change: '💼',
  funding: '💰',
  hiring: '👥',
  content_engagement: '💬',
  website_visit: '🌐',
  social_mention: '📢',
};
