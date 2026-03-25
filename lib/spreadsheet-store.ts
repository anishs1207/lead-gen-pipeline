// In-memory store for spreadsheet instances
// In production, this would be replaced with a database

import { SpreadsheetInstance, Lead, Column, DEFAULT_COLUMNS } from './types';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage
const spreadsheets: Map<string, SpreadsheetInstance> = new Map();

// Initialize with a default spreadsheet
const defaultSpreadsheet: SpreadsheetInstance = {
  id: 'default',
  name: 'My Leads',
  description: 'Default lead spreadsheet',
  columns: DEFAULT_COLUMNS,
  leads: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

spreadsheets.set('default', defaultSpreadsheet);

export const SpreadsheetStore = {
  // Get all spreadsheets
  getAll(): SpreadsheetInstance[] {
    return Array.from(spreadsheets.values());
  },

  // Get a single spreadsheet by ID
  get(id: string): SpreadsheetInstance | undefined {
    return spreadsheets.get(id);
  },

  // Create a new spreadsheet
  create(name: string, description?: string): SpreadsheetInstance {
    const id = uuidv4();
    const newSpreadsheet: SpreadsheetInstance = {
      id,
      name,
      description,
      columns: [...DEFAULT_COLUMNS],
      leads: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    spreadsheets.set(id, newSpreadsheet);
    return newSpreadsheet;
  },

  // Update a spreadsheet
  update(id: string, updates: Partial<SpreadsheetInstance>): SpreadsheetInstance | undefined {
    const existing = spreadsheets.get(id);
    if (!existing) return undefined;

    const updated: SpreadsheetInstance = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    spreadsheets.set(id, updated);
    return updated;
  },

  // Delete a spreadsheet
  delete(id: string): boolean {
    return spreadsheets.delete(id);
  },

  // Add leads to a spreadsheet
  addLeads(spreadsheetId: string, leads: Lead[]): SpreadsheetInstance | undefined {
    const spreadsheet = spreadsheets.get(spreadsheetId);
    if (!spreadsheet) return undefined;

    const updated: SpreadsheetInstance = {
      ...spreadsheet,
      leads: [...leads, ...spreadsheet.leads],
      updatedAt: new Date(),
    };
    spreadsheets.set(spreadsheetId, updated);
    return updated;
  },

  // Update a lead in a spreadsheet
  updateLead(spreadsheetId: string, leadId: string, updates: Partial<Lead>): SpreadsheetInstance | undefined {
    const spreadsheet = spreadsheets.get(spreadsheetId);
    if (!spreadsheet) return undefined;

    const leadIndex = spreadsheet.leads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) return undefined;

    const updatedLeads = [...spreadsheet.leads];
    updatedLeads[leadIndex] = {
      ...updatedLeads[leadIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const updated: SpreadsheetInstance = {
      ...spreadsheet,
      leads: updatedLeads,
      updatedAt: new Date(),
    };
    spreadsheets.set(spreadsheetId, updated);
    return updated;
  },

  // Delete a lead from a spreadsheet
  deleteLead(spreadsheetId: string, leadId: string): SpreadsheetInstance | undefined {
    const spreadsheet = spreadsheets.get(spreadsheetId);
    if (!spreadsheet) return undefined;

    const updated: SpreadsheetInstance = {
      ...spreadsheet,
      leads: spreadsheet.leads.filter(l => l.id !== leadId),
      updatedAt: new Date(),
    };
    spreadsheets.set(spreadsheetId, updated);
    return updated;
  },

  // Add a column to a spreadsheet
  addColumn(spreadsheetId: string, column: Column): SpreadsheetInstance | undefined {
    const spreadsheet = spreadsheets.get(spreadsheetId);
    if (!spreadsheet) return undefined;

    const updated: SpreadsheetInstance = {
      ...spreadsheet,
      columns: [...spreadsheet.columns, column],
      updatedAt: new Date(),
    };
    spreadsheets.set(spreadsheetId, updated);
    return updated;
  },

  // Remove a column from a spreadsheet
  removeColumn(spreadsheetId: string, columnId: string): SpreadsheetInstance | undefined {
    const spreadsheet = spreadsheets.get(spreadsheetId);
    if (!spreadsheet) return undefined;

    const updated: SpreadsheetInstance = {
      ...spreadsheet,
      columns: spreadsheet.columns.filter(c => c.id !== columnId),
      updatedAt: new Date(),
    };
    spreadsheets.set(spreadsheetId, updated);
    return updated;
  },

  // Filter leads based on criteria
  filterLeads(spreadsheetId: string, criteria: Record<string, unknown>): Lead[] {
    const spreadsheet = spreadsheets.get(spreadsheetId);
    if (!spreadsheet) return [];

    return spreadsheet.leads.filter(lead => {
      for (const [key, value] of Object.entries(criteria)) {
        const leadValue = (lead as unknown as Record<string, unknown>)[key];
        
        if (typeof value === 'object' && value !== null) {
          // Handle comparison operators
          const ops = value as Record<string, unknown>;
          if ('gte' in ops && typeof leadValue === 'number' && leadValue < (ops.gte as number)) return false;
          if ('lte' in ops && typeof leadValue === 'number' && leadValue > (ops.lte as number)) return false;
          if ('eq' in ops && leadValue !== ops.eq) return false;
          if ('contains' in ops && typeof leadValue === 'string' && !leadValue.toLowerCase().includes((ops.contains as string).toLowerCase())) return false;
        } else {
          if (leadValue !== value) return false;
        }
      }
      return true;
    });
  },

  // Sort leads
  sortLeads(spreadsheetId: string, key: string, order: 'asc' | 'desc' = 'asc'): Lead[] {
    const spreadsheet = spreadsheets.get(spreadsheetId);
    if (!spreadsheet) return [];

    return [...spreadsheet.leads].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[key];
      const bVal = (b as unknown as Record<string, unknown>)[key];
      
      if (aVal === undefined) return order === 'asc' ? 1 : -1;
      if (bVal === undefined) return order === 'asc' ? -1 : 1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  },

  // Detect signals for a lead
  detectSignals(lead: Lead): Lead {
    // This would integrate with external APIs to detect signals
    // For now, we'll add some mock signal detection logic
    const signals = [...lead.signals];
    
    // Example: High score might indicate engagement
    if (lead.score >= 80 && !signals.find(s => s.type === 'content_engagement')) {
      // Could add a signal here based on actual data
    }
    
    return {
      ...lead,
      signals,
      updatedAt: new Date(),
    };
  },

  // Bulk update leads
  bulkUpdateLeads(
    spreadsheetId: string,
    leadIds: string[],
    updates: Partial<Lead>
  ): SpreadsheetInstance | undefined {
    const spreadsheet = spreadsheets.get(spreadsheetId);
    if (!spreadsheet) return undefined;

    const updatedLeads = spreadsheet.leads.map(lead => {
      if (leadIds.includes(lead.id)) {
        return {
          ...lead,
          ...updates,
          updatedAt: new Date(),
        };
      }
      return lead;
    });

    const updated: SpreadsheetInstance = {
      ...spreadsheet,
      leads: updatedLeads,
      updatedAt: new Date(),
    };
    spreadsheets.set(spreadsheetId, updated);
    return updated;
  },
};

export default SpreadsheetStore;
