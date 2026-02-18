"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    FileSpreadsheet,
    MoreVertical,
    Edit2,
    Check,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SpreadsheetInstance } from "@/lib/types";

interface SpreadsheetInstancesProps {
    currentId: string;
    onSelect: (id: string) => void;
    onSpreadsheetChange?: (spreadsheet: SpreadsheetInstance) => void;
}

export default function SpreadsheetInstances({
    currentId,
    onSelect,
    onSpreadsheetChange
}: SpreadsheetInstancesProps) {
    const [spreadsheets, setSpreadsheets] = useState<SpreadsheetInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    // Fetch all spreadsheets
    const fetchSpreadsheets = async () => {
        try {
            const response = await fetch('/api/spreadsheets');
            const data = await response.json();
            if (data.success) {
                setSpreadsheets(data.spreadsheets);
            }
        } catch (error) {
            console.error('Failed to fetch spreadsheets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpreadsheets();
    }, []);

    // Create new spreadsheet
    const handleCreate = async () => {
        if (!newName.trim()) return;

        try {
            const response = await fetch('/api/spreadsheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const data = await response.json();
            if (data.success) {
                setSpreadsheets(prev => [...prev, data.spreadsheet]);
                setNewName("");
                setShowNewForm(false);
                onSelect(data.spreadsheet.id);
            }
        } catch (error) {
            console.error('Failed to create spreadsheet:', error);
        }
    };

    // Delete spreadsheet
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this spreadsheet?')) return;

        try {
            const response = await fetch(`/api/spreadsheets?id=${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setSpreadsheets(prev => prev.filter(s => s.id !== id));
                if (currentId === id) {
                    const remaining = spreadsheets.filter(s => s.id !== id);
                    if (remaining.length > 0) {
                        onSelect(remaining[0].id);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to delete spreadsheet:', error);
        }
    };

    // Rename spreadsheet
    const handleRename = async (id: string) => {
        if (!editName.trim()) {
            setEditingId(null);
            return;
        }

        try {
            const response = await fetch('/api/spreadsheets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editName.trim() }),
            });
            const data = await response.json();
            if (data.success) {
                setSpreadsheets(prev =>
                    prev.map(s => s.id === id ? { ...s, name: editName.trim() } : s)
                );
                setEditingId(null);
            }
        } catch (error) {
            console.error('Failed to rename spreadsheet:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-500">
                Loading spreadsheets...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Spreadsheets
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewForm(true)}
                    className="h-7 w-7 p-0"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {/* New spreadsheet form */}
            {showNewForm && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Spreadsheet name"
                            className="h-8 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                        />
                        <Button size="sm" className="h-8" onClick={handleCreate}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={() => {
                                setShowNewForm(false);
                                setNewName("");
                            }}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Spreadsheet list */}
            <div className="flex-1 overflow-y-auto">
                {spreadsheets.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No spreadsheets yet. Create one to get started!
                    </div>
                ) : (
                    <div className="py-2">
                        {spreadsheets.map((spreadsheet) => (
                            <div
                                key={spreadsheet.id}
                                className={`group flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${currentId === spreadsheet.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-r-2 border-indigo-500'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                onClick={() => onSelect(spreadsheet.id)}
                            >
                                <FileSpreadsheet
                                    className={`w-4 h-4 flex-shrink-0 ${currentId === spreadsheet.id
                                            ? 'text-indigo-500'
                                            : 'text-gray-400'
                                        }`}
                                />

                                {editingId === spreadsheet.id ? (
                                    <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-6 text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename(spreadsheet.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            autoFocus
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleRename(spreadsheet.id)}
                                        >
                                            <Check className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() => setEditingId(null)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm truncate ${currentId === spreadsheet.id
                                                    ? 'font-medium text-indigo-700 dark:text-indigo-300'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {spreadsheet.name}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {spreadsheet.leads.length} leads
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setEditingId(spreadsheet.id);
                                                    setEditName(spreadsheet.name);
                                                }}>
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(spreadsheet.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
