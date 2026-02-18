import { NextRequest, NextResponse } from 'next/server';
import { SpreadsheetStore } from '@/lib/spreadsheet-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadsheetId, format = 'csv', filters, selectedRows } = body;

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }

    const spreadsheet = SpreadsheetStore.get(spreadsheetId);
    if (!spreadsheet) {
      return NextResponse.json(
        { success: false, message: 'Spreadsheet not found' },
        { status: 404 }
      );
    }

    let leads = spreadsheet.leads;

    // Apply filters if provided
    if (filters && Object.keys(filters).length > 0) {
      leads = SpreadsheetStore.filterLeads(spreadsheetId, filters);
    }

    // Filter by selected rows if provided
    if (selectedRows && selectedRows.length > 0) {
      leads = leads.filter(lead => selectedRows.includes(lead.id));
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = spreadsheet.columns.map(col => col.label);
      const rows = leads.map(lead => {
        return spreadsheet.columns.map(col => {
          const value = (lead as unknown as Record<string, unknown>)[col.key];
          if (Array.isArray(value)) {
            return value.join('; ');
          }
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return String(value ?? '');
        });
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${spreadsheet.name}_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (format === 'xlsx') {
      // For XLSX, we'll return JSON that the frontend can convert
      // In production, you'd use a library like xlsx or exceljs
      const excelData = {
        name: spreadsheet.name,
        columns: spreadsheet.columns,
        rows: leads.map(lead => {
          const row: Record<string, unknown> = {};
          spreadsheet.columns.forEach(col => {
            const value = (lead as unknown as Record<string, unknown>)[col.key];
            if (Array.isArray(value)) {
              row[col.key] = value.join('; ');
            } else if (typeof value === 'object' && value !== null) {
              row[col.key] = JSON.stringify(value);
            } else {
              row[col.key] = value;
            }
          });
          return row;
        }),
      };

      return NextResponse.json({
        success: true,
        format: 'xlsx',
        data: excelData,
        message: 'Excel data prepared. Use a client-side library to generate the file.',
      });
    }

    // JSON format
    return NextResponse.json({
      success: true,
      format: 'json',
      data: {
        name: spreadsheet.name,
        columns: spreadsheet.columns,
        leads,
        exportedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export spreadsheet', error: String(error) },
      { status: 500 }
    );
  }
}
