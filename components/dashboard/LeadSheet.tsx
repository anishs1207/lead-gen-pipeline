"use client";

import React, { useState, useEffect, useCallback } from "react";
import Spreadsheet, { CellBase, DataViewerProps } from "react-spreadsheet";
import {
    Star,
    Check,
    Plus,
    Trash2,
    Download,
    Search,
    Sparkles,
    RefreshCw,
    ExternalLink,
    X,
    BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Lead,
    SpreadsheetInstance,
    Signal,
    LeadStatus,
    SignalType,
    STATUS_COLORS,
    SIGNAL_COLORS,
    SIGNAL_ICONS
} from "@/lib/types";

// Badge component for consistent styling
const Badge = ({
    children,
    color,
    textColor = "white",
    className = "",
}: {
    children: React.ReactNode;
    color: string;
    textColor?: string;
    className?: string;
}) => (
    <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}
        style={{ color: textColor === "white" ? "#fff" : textColor }}
    >
        {children}
    </span>
);

// Signal Badge component
const SignalBadge = ({ signal }: { signal: Signal }) => {
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SIGNAL_COLORS[signal.type]}`}
            title={signal.description}
        >
            <span>{SIGNAL_ICONS[signal.type]}</span>
            <span className="text-white capitalize">{signal.type.replace('_', ' ')}</span>
        </span>
    );
};

// Link badge for social/email links
const LinkBadge = ({ url, type }: { url: string; type: 'linkedin' | 'twitter' | 'email' | 'website' }) => {
    if (!url) return null;

    const colors: Record<string, string> = {
        linkedin: 'bg-blue-600 hover:bg-blue-700',
        twitter: 'bg-sky-500 hover:bg-sky-600',
        email: 'bg-emerald-600 hover:bg-emerald-700',
        website: 'bg-purple-600 hover:bg-purple-700',
    };

    const icons: Record<string, string> = {
        linkedin: '💼',
        twitter: '🐦',
        email: '📧',
        website: '🌐',
    };

    const href = type === 'email' ? `mailto:${url}` :
        url.startsWith('http') ? url : `https://${url}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white transition-colors ${colors[type]}`}
        >
            <span>{icons[type]}</span>
            <ExternalLink className="w-3 h-3" />
        </a>
    );
};

// Status badge
const StatusBadge = ({ status }: { status: LeadStatus }) => {
    const statusLabels: Record<LeadStatus, string> = {
        new: 'New',
        contacted: 'Contacted',
        replied: 'Replied',
        qualified: 'Qualified',
        closed: 'Won',
        lost: 'Lost',
    };

    return (
        <Badge color={STATUS_COLORS[status]}>
            {status === 'qualified' && <Check className="w-3 h-3 mr-1" />}
            {statusLabels[status]}
        </Badge>
    );
};

// Score badge with visual indicator
const ScoreBadge = ({ score }: { score: number }) => {
    const scoreColor = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Badge color={scoreColor}>{score}</Badge>
        </div>
    );
};

// Simple hash function to get consistent color for unknown values
const getColorForValue = (value: string): string => {
    const colorPalette = [
        "bg-pink-500", "bg-violet-500", "bg-cyan-500", "bg-orange-500",
        "bg-lime-500", "bg-fuchsia-500", "bg-sky-500", "bg-yellow-500",
    ];
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorPalette[Math.abs(hash) % colorPalette.length];
};

type SheetCell = CellBase<string | number>;

interface LeadSheetProps {
    spreadsheetId?: string;
    onDataChange?: (data: Lead[]) => void;
}

export default function LeadSheet({ spreadsheetId = 'default', onDataChange }: LeadSheetProps) {
    const [spreadsheet, setSpreadsheet] = useState<SpreadsheetInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showAddRow, setShowAddRow] = useState(false);
    const [newRowData, setNewRowData] = useState({ name: '', company: '', email: '' });

    // Fetch spreadsheet data
    const fetchSpreadsheet = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/spreadsheets?id=${spreadsheetId}`);
            const data = await response.json();
            if (data.success) {
                setSpreadsheet(data.spreadsheet);
            }
        } catch (error) {
            console.error('Failed to fetch spreadsheet:', error);
        } finally {
            setLoading(false);
        }
    }, [spreadsheetId]);

    useEffect(() => {
        fetchSpreadsheet();
    }, [fetchSpreadsheet]);

    // Search for leads
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch('/api/leads/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: searchQuery,
                    spreadsheetId,
                    maxResults: 10,
                }),
            });
            const data = await response.json();
            if (data.success) {
                await fetchSpreadsheet();
                setSearchQuery("");
            }
        } catch (error) {
            console.error('Failed to search leads:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Add a new row
    const handleAddRow = async () => {
        if (!newRowData.name) return;

        try {
            const response = await fetch('/api/spreadsheets', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spreadsheetId,
                    action: 'addRow',
                    data: newRowData,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setSpreadsheet(data.spreadsheet);
                setNewRowData({ name: '', company: '', email: '' });
                setShowAddRow(false);
            }
        } catch (error) {
            console.error('Failed to add row:', error);
        }
    };

    // Delete a lead
    const handleDeleteLead = async (leadId: string) => {
        try {
            const response = await fetch('/api/spreadsheets', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spreadsheetId,
                    action: 'removeRow',
                    data: { leadId },
                }),
            });
            const data = await response.json();
            if (data.success) {
                setSpreadsheet(data.spreadsheet);
            }
        } catch (error) {
            console.error('Failed to delete lead:', error);
        }
    };

    // Export spreadsheet
    const handleExport = async (format: 'csv' | 'xlsx') => {
        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spreadsheetId,
                    format,
                }),
            });

            if (format === 'csv') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                // Convert to Excel using client-side library
                console.log('Excel data:', data);
                alert('Excel export data prepared. In production, this would download as .xlsx file.');
            }
        } catch (error) {
            console.error('Failed to export:', error);
        }
    };

    // Detect signals
    const handleDetectSignals = async () => {
        try {
            const response = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spreadsheetId,
                    analyzeAll: true,
                }),
            });
            const data = await response.json();
            if (data.success && data.spreadsheet) {
                setSpreadsheet(data.spreadsheet);
            }
        } catch (error) {
            console.error('Failed to detect signals:', error);
        }
    };

    // Convert leads to spreadsheet data format
    const getSpreadsheetData = (): (SheetCell | undefined)[][] => {
        if (!spreadsheet) return [];

        // Header row
        const headers: (SheetCell | undefined)[] = [
            { value: "Name" },
            { value: "Company" },
            { value: "Role" },
            { value: "LinkedIn" },
            { value: "Twitter" },
            { value: "Email" },
            { value: "Status" },
            { value: "Score" },
            { value: "" }, // Actions column
        ];

        // Data rows
        const rows = spreadsheet.leads.map(lead => [
            { value: lead.name },
            { value: lead.company || '' },
            { value: lead.role || '' },
            { value: lead.linkedin || '' },
            { value: lead.twitter || '' },
            { value: lead.email || '' },
            { value: lead.status },
            { value: lead.score },
            { value: lead.id }, // Store ID for delete action
        ]);

        // Add empty rows for padding
        const emptyRows = Array(Math.max(0, 15 - rows.length)).fill(null).map(() =>
            Array(9).fill(undefined).map(() => ({ value: '' }))
        );

        return [headers, ...rows, ...emptyRows];
    };

    // Custom cell renderer
    const CustomDataViewer = <Cell extends CellBase>({
        cell,
        row,
        column,
    }: DataViewerProps<Cell>) => {
        const val = cell?.value;

        // Header row
        if (row === 0) {
            return (
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {val}
                </span>
            );
        }

        // Get the lead for this row
        const lead = spreadsheet?.leads[row - 1];

        // Name column (0)
        if (column === 0 && typeof val === 'string' && val) {
            return (
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getColorForValue(val).replace('bg-', '') }}
                    />
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                        {val}
                    </span>
                </div>
            );
        }

        // LinkedIn column (3)
        if (column === 3 && val) {
            return <LinkBadge url={String(val)} type="linkedin" />;
        }

        // Twitter column (4)
        if (column === 4 && val) {
            return <LinkBadge url={String(val)} type="twitter" />;
        }

        // Email column (5)
        if (column === 5 && val) {
            return <LinkBadge url={String(val)} type="email" />;
        }

        // Status column (6)
        if (column === 6 && typeof val === 'string' && val) {
            return <StatusBadge status={val as LeadStatus} />;
        }

        // Score column (7)
        if (column === 7 && (typeof val === 'number' || !isNaN(Number(val)))) {
            return <ScoreBadge score={Number(val)} />;
        }

        // Actions column (8) - was 10
        if (column === 8 && lead) {
            return (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLead(lead.id);
                    }}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                    title="Delete lead"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            );
        }

        // Role column (2) - badge
        if (column === 2 && typeof val === 'string' && val) {
            return <Badge color={getColorForValue(val)}>{val}</Badge>;
        }

        // Default render
        if (val !== undefined && val !== null && val !== '') {
            return (
                <span className="text-gray-700 dark:text-gray-300">{String(val)}</span>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col max-h-screen w-1/2 overflow-hidden bg-white dark:bg-gray-900">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {/* Search/Scrape leads */}
                <div className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Find leads for... (e.g., AI startups in healthcare)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9 pr-4 h-9"
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        size="sm"
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                        {isSearching ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        <span className="ml-1">Find</span>
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddRow(!showAddRow)}
                        title="Add new row"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDetectSignals}
                        title="Detect signals"
                    >
                        <BellRing className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('csv')}
                        title="Export as CSV"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSpreadsheet}
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Add Row Form */}
            {showAddRow && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                    <Input
                        placeholder="Name"
                        value={newRowData.name}
                        onChange={(e) => setNewRowData({ ...newRowData, name: e.target.value })}
                        className="h-8 w-32"
                    />
                    <Input
                        placeholder="Company"
                        value={newRowData.company}
                        onChange={(e) => setNewRowData({ ...newRowData, company: e.target.value })}
                        className="h-8 w-32"
                    />
                    <Input
                        placeholder="Email"
                        value={newRowData.email}
                        onChange={(e) => setNewRowData({ ...newRowData, email: e.target.value })}
                        className="h-8 w-40"
                    />
                    <Button size="sm" onClick={handleAddRow} disabled={!newRowData.name}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddRow(false)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Spreadsheet Info */}
            <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <span>{spreadsheet?.name || 'Untitled'}</span>
                <span>{spreadsheet?.leads.length || 0} leads</span>
            </div>

            {/* Spreadsheet */}
            <div className="flex-1 overflow-auto">
                {spreadsheet && spreadsheet.leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                            <Sparkles className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            No leads yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                            Start building your lead list by searching for prospects or scraping a website using the chat assistant.
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-indigo-500" />
                                <span>Search for leads in the toolbar above</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4 text-purple-500" />
                                <span>Add leads manually using the + button</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-pink-500" />
                                <span>Use the AI chat to scrape websites for leads</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="min-w-max">
                        <Spreadsheet
                            data={getSpreadsheetData()}
                            DataViewer={CustomDataViewer}
                            darkMode={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
