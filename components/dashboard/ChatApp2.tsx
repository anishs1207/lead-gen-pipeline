"use client";

import { useState, useCallback, useEffect } from "react";
import { SidebarProvider, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import LeadSheet from "./LeadSheet";
import SheetChat from "./SheetChat";
import SpreadsheetInstances from "./SpreadsheetInstances";
import { SpreadsheetInstance } from "@/lib/types";
import { PanelLeftClose, MessageSquare, FileSpreadsheet, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatApp() {
    const [currentSpreadsheetId, setCurrentSpreadsheetId] = useState<string>("default");
    const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetInstance | null>(null);
    const [showChat, setShowChat] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch initial spreadsheet data
    const fetchSpreadsheetData = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const response = await fetch(`/api/spreadsheets?id=${currentSpreadsheetId}`);
            const data = await response.json();
            if (data.success) {
                setSpreadsheetData(data.spreadsheet);
            }
        } catch (error) {
            console.error('Failed to fetch spreadsheet:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [currentSpreadsheetId]);

    useEffect(() => {
        fetchSpreadsheetData();
    }, [fetchSpreadsheetData]);

    const handleSpreadsheetSelect = useCallback((id: string) => {
        setCurrentSpreadsheetId(id);
    }, []);

    const handleSpreadsheetChange = useCallback((spreadsheet: SpreadsheetInstance) => {
        setSpreadsheetData(spreadsheet);
    }, []);

    const handleSpreadsheetUpdate = useCallback((data: Partial<SpreadsheetInstance>) => {
        if (spreadsheetData) {
            setSpreadsheetData({ ...spreadsheetData, ...data });
        }
        // Also refetch to ensure we have latest data
        fetchSpreadsheetData();
    }, [spreadsheetData, fetchSpreadsheetData]);

    return (
        <SidebarProvider>
            {/* Left Sidebar - Spreadsheet Instances */}
            <Sidebar
                side="left"
                variant="sidebar"
                collapsible="icon"
                className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
                <SidebarHeader className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 px-4 py-3">
                        <div className="relative">
                            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                            <Sparkles className="w-3 h-3 text-purple-500 absolute -top-1 -right-1" />
                        </div>
                        <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Lead CRM</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SpreadsheetInstances
                        currentId={currentSpreadsheetId}
                        onSelect={handleSpreadsheetSelect}
                        onSpreadsheetChange={handleSpreadsheetChange}
                    />
                </SidebarContent>
            </Sidebar>

            {/* Main Content */}
            <SidebarInset className="flex flex-col min-w-0 overflow-hidden h-screen bg-gray-50 dark:bg-gray-950">
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="h-8 w-8" />
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Lead Generation & CRM
                            </h1>
                            {spreadsheetData && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    {spreadsheetData.leads.length} leads
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchSpreadsheetData}
                            disabled={isRefreshing}
                            className="h-8 w-8 p-0"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowChat(!showChat)}
                            className={`h-8 px-3 ${showChat ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-500'}`}
                        >
                            <MessageSquare className="w-4 h-4 mr-1.5" />
                            <span className="text-sm">AI Chat</span>
                        </Button>
                    </div>
                </header>

                {/* Main area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Spreadsheet */}
                    <LeadSheet
                        spreadsheetId={currentSpreadsheetId}
                        onDataChange={(leads) => {
                            if (spreadsheetData) {
                                setSpreadsheetData({ ...spreadsheetData, leads });
                            }
                        }}
                    />

                    {/* Chat Panel */}
                    {showChat && (
                        <div className="w-[420px] flex-shrink-0 border-l border-gray-200 dark:border-gray-700 shadow-xl">
                            <SheetChat
                                spreadsheetId={currentSpreadsheetId}
                                spreadsheetData={spreadsheetData || undefined}
                                onSpreadsheetUpdate={handleSpreadsheetUpdate}
                            />
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
