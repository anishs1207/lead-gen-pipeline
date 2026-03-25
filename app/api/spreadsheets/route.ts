import { NextRequest, NextResponse } from 'next/server';
import { SpreadsheetStore } from '@/lib/spreadsheet-store';
import { SpreadsheetInstance, Column } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// GET - List all spreadsheets or get a specific one
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const spreadsheet = SpreadsheetStore.get(id);
      if (!spreadsheet) {
        return NextResponse.json(
          { success: false, message: 'Spreadsheet not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, spreadsheet });
    }

    const spreadsheets = SpreadsheetStore.getAll();
    return NextResponse.json({ success: true, spreadsheets });
  } catch (error) {
    console.error('Get spreadsheets error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get spreadsheets' },
      { status: 500 }
    );
  }
}

// POST - Create a new spreadsheet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    const spreadsheet = SpreadsheetStore.create(name, description);
    return NextResponse.json({ success: true, spreadsheet }, { status: 201 });
  } catch (error) {
    console.error('Create spreadsheet error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create spreadsheet' },
      { status: 500 }
    );
  }
}

// PUT - Update a spreadsheet
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, columns, leads } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }

    const updates: Partial<SpreadsheetInstance> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (columns !== undefined) updates.columns = columns;
    if (leads !== undefined) updates.leads = leads;

    const spreadsheet = SpreadsheetStore.update(id, updates);
    if (!spreadsheet) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, spreadsheet });
  } catch (error) {
    console.error('Update spreadsheet error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update spreadsheet' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a spreadsheet
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }

    const deleted = SpreadsheetStore.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Spreadsheet deleted' });
  } catch (error) {
    console.error('Delete spreadsheet error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete spreadsheet' },
      { status: 500 }
    );
  }
}

// PATCH - Add/remove column or row
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadsheetId, action, data } = body;

    if (!spreadsheetId || !action) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet ID and action are required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'addColumn': {
        const newColumn: Column = {
          id: uuidv4(),
          key: data.key || `column_${Date.now()}`,
          label: data.label || 'New Column',
          type: data.type || 'text',
          sortable: data.sortable ?? true,
          filterable: data.filterable ?? true,
        };
        result = SpreadsheetStore.addColumn(spreadsheetId, newColumn);
        break;
      }

      case 'removeColumn':
        if (!data.columnId) {
          return NextResponse.json(
            { success: false, message: 'Column ID is required' },
            { status: 400 }
          );
        }
        result = SpreadsheetStore.removeColumn(spreadsheetId, data.columnId);
        break;

      case 'addRow': {
        const newLead = {
          id: uuidv4(),
          name: data.name || '',
          company: data.company || '',
          role: data.role || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          email: data.email || '',
          status: 'new' as const,
          score: data.score || 0,
          signals: [],
          tags: data.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        result = SpreadsheetStore.addLeads(spreadsheetId, [newLead]);
        break;
      }

      case 'removeRow':
        if (!data.leadId) {
          return NextResponse.json(
            { success: false, message: 'Lead ID is required' },
            { status: 400 }
          );
        }
        result = SpreadsheetStore.deleteLead(spreadsheetId, data.leadId);
        break;

      case 'updateRow':
        if (!data.leadId) {
          return NextResponse.json(
            { success: false, message: 'Lead ID is required' },
            { status: 400 }
          );
        }
        result = SpreadsheetStore.updateLead(spreadsheetId, data.leadId, data.updates);
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet not found or operation failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, spreadsheet: result });
  } catch (error) {
    console.error('Patch spreadsheet error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update spreadsheet' },
      { status: 500 }
    );
  }
}



// // npm install @mendable/firecrawl-js
// import Firecrawl from '@mendable/firecrawl-js';

// const app = new Firecrawl({ apiKey: "fc-9eb86bac35f14d57a9cbb46558e0d8e6"  });

// // Scrape a website:
// app.scrape('firecrawl.dev')