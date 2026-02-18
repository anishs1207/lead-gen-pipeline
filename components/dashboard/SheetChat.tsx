"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Send,
    Sparkles,
    MessageSquare,
    Loader2,
    Filter,
    Edit,
    Trash2,
    Download,
    ArrowUpDown,
    Plus,
    Search,
    RefreshCw,
    Zap,
    Globe,
    UserPlus,
    BarChart3,
    X,
    Building2,
    Mail,
    Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChatMessage, ChatResponse, SpreadsheetInstance } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface ChatAction {
    type: string;
    icon: React.ReactNode;
    label: string;
}

const ACTION_ICONS: Record<string, ChatAction> = {
    filter: { type: 'filter', icon: <Filter className="w-4 h-4" />, label: 'Filtered' },
    update: { type: 'update', icon: <Edit className="w-4 h-4" />, label: 'Updated' },
    delete: { type: 'delete', icon: <Trash2 className="w-4 h-4" />, label: 'Deleted' },
    sort: { type: 'sort', icon: <ArrowUpDown className="w-4 h-4" />, label: 'Sorted' },
    export: { type: 'export', icon: <Download className="w-4 h-4" />, label: 'Exported' },
    add: { type: 'add', icon: <Plus className="w-4 h-4" />, label: 'Added' },
    search: { type: 'search', icon: <Search className="w-4 h-4" />, label: 'Searched' },
    analyze: { type: 'analyze', icon: <BarChart3 className="w-4 h-4" />, label: 'Analyzed' },
    addColumn: { type: 'addColumn', icon: <Plus className="w-4 h-4" />, label: 'Column Added' },
    deleteColumn: { type: 'deleteColumn', icon: <Trash2 className="w-4 h-4" />, label: 'Column Removed' },
};

interface SheetChatProps {
    spreadsheetId: string;
    spreadsheetData?: SpreadsheetInstance;
    onSpreadsheetUpdate?: (data: Partial<SpreadsheetInstance>) => void;
}

export default function SheetChat({
    spreadsheetId,
    spreadsheetData,
    onSpreadsheetUpdate
}: SheetChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: `👋 Hi! I'm your **AI-powered CRM assistant**. I have full access to your spreadsheet data and can help you:

**➕ Add Leads:**
- *"Add John Smith from Acme Corp as Sales Director"*
- *"Add lead: Jane Doe, TechCo, jane@techco.com"*
- Use the 👤 button above for quick form entry

**✏️ Update & Manage:**
- *"Mark John as qualified with score 85"*
- *"Update all new leads to contacted status"*
- *"Delete all lost leads"*

**🔍 Search & Filter:**
- *"Show me only qualified leads"*
- *"Find leads with score > 80"*
- *"Search for anyone from Google"*

**📊 Analyze Data:**
- *"What's the average lead score?"*
- *"How many leads are qualified?"*
- *"Who has the highest score?"*

**🌐 Web Scraping:**
- Click 🌍 to scrape leads from any website
- *"Find SaaS startup founders"*

Try saying: **"Add a lead named Alex from Startup Co"**`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showScrapeInput, setShowScrapeInput] = useState(false);
    const [scrapeUrl, setScrapeUrl] = useState("");
    const [isScraping, setIsScraping] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickAddData, setQuickAddData] = useState({ name: '', company: '', email: '', role: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    }, [input]);

    // Handle scraping a URL
    const handleScrapeUrl = async () => {
        if (!scrapeUrl.trim() || isScraping) return;

        setIsScraping(true);

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: `🔗 Scrape leads from: ${scrapeUrl}`,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch('/api/leads/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: scrapeUrl,
                    spreadsheetId,
                    maxResults: 10,
                }),
            });

            const data = await response.json();

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.success
                    ? `✅ Successfully scraped **${data.leads?.length || 0} leads** from ${scrapeUrl}!\n\nThe leads have been added to your spreadsheet. You can now:\n- Ask me to filter or sort them\n- Update their status\n- Analyze the data`
                    : `❌ Failed to scrape the URL. ${data.message || 'Please try again.'}`,
                timestamp: new Date(),
                action: data.success ? { type: 'add', affectedRows: data.leads?.map((l: { id: string }) => l.id) || [] } : undefined,
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (data.success && onSpreadsheetUpdate) {
                // Refresh the spreadsheet data
                const refreshResponse = await fetch(`/api/spreadsheets?id=${spreadsheetId}`);
                const refreshData = await refreshResponse.json();
                if (refreshData.success) {
                    onSpreadsheetUpdate(refreshData.spreadsheet);
                }
            }

            setScrapeUrl("");
            setShowScrapeInput(false);
        } catch (error) {
            console.error('Scrape error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "❌ An error occurred while scraping. Please check the URL and try again.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsScraping(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input.trim(),
                    spreadsheetId,
                    spreadsheetData,
                    conversationHistory: messages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data: ChatResponse & { success: boolean } = await response.json();

            if (data.success) {
                const assistantMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date(),
                    action: data.action,
                };

                setMessages(prev => [...prev, assistantMessage]);

                // If there's updated data, notify parent
                if (data.updatedData && onSpreadsheetUpdate) {
                    onSpreadsheetUpdate(data.updatedData);
                }
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Quick action suggestions - organized by category
    const suggestions = [
        { label: "Add John Smith from Acme Corp", icon: <UserPlus className="w-3 h-3" />, category: 'add' },
        { label: "Show all qualified leads", icon: <Filter className="w-3 h-3" />, category: 'filter' },
        { label: "Sort by score descending", icon: <ArrowUpDown className="w-3 h-3" />, category: 'sort' },
        { label: "What's the average lead score?", icon: <BarChart3 className="w-3 h-3" />, category: 'analyze' },
        { label: "Find leads from tech companies", icon: <Search className="w-3 h-3" />, category: 'search' },
        { label: "Mark all new leads as contacted", icon: <Edit className="w-3 h-3" />, category: 'update' },
    ];

    // Handle quick add lead from form
    const handleQuickAddLead = async () => {
        if (!quickAddData.name.trim()) return;

        const addMessage = `Add lead: ${quickAddData.name}${quickAddData.company ? ` from ${quickAddData.company}` : ''}${quickAddData.role ? ` as ${quickAddData.role}` : ''}${quickAddData.email ? ` with email ${quickAddData.email}` : ''}`;

        setInput(addMessage);
        setShowQuickAdd(false);
        setQuickAddData({ name: '', company: '', email: '', role: '' });

        // Auto-send after a brief delay to show the message
        setTimeout(() => {
            handleSend();
        }, 100);
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-l border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                        <Sparkles className="w-3 h-3 text-purple-500 absolute -top-1 -right-1" />
                    </div>
                    <h3 className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        AI Assistant
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setShowQuickAdd(!showQuickAdd);
                            if (showScrapeInput) setShowScrapeInput(false);
                        }}
                        className={`h-8 px-2 ${showQuickAdd ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : ''}`}
                        title="Quick add a lead"
                    >
                        <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setShowScrapeInput(!showScrapeInput);
                            if (showQuickAdd) setShowQuickAdd(false);
                        }}
                        className={`h-8 px-2 ${showScrapeInput ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' : ''}`}
                        title="Scrape website for leads"
                    >
                        <Globe className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Quick Add Lead Form */}
            {showQuickAdd && (
                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Quick Add Lead</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowQuickAdd(false)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="relative">
                            <Input
                                placeholder="Name *"
                                value={quickAddData.name}
                                onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
                                className="h-8 text-sm pl-7"
                            />
                            <UserPlus className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="relative">
                            <Input
                                placeholder="Company"
                                value={quickAddData.company}
                                onChange={(e) => setQuickAddData({ ...quickAddData, company: e.target.value })}
                                className="h-8 text-sm pl-7"
                            />
                            <Building2 className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="relative">
                            <Input
                                placeholder="Role/Title"
                                value={quickAddData.role}
                                onChange={(e) => setQuickAddData({ ...quickAddData, role: e.target.value })}
                                className="h-8 text-sm pl-7"
                            />
                            <Briefcase className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="relative">
                            <Input
                                placeholder="Email"
                                value={quickAddData.email}
                                onChange={(e) => setQuickAddData({ ...quickAddData, email: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickAddLead()}
                                className="h-8 text-sm pl-7"
                            />
                            <Mail className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleQuickAddLead}
                        disabled={!quickAddData.name.trim() || isLoading}
                        className="w-full h-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                            <Plus className="w-4 h-4 mr-1" />
                        )}
                        Add Lead
                    </Button>
                </div>
            )}

            {/* Scrape URL Input */}
            {showScrapeInput && (
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <Input
                            type="url"
                            placeholder="Enter URL to scrape leads from..."
                            value={scrapeUrl}
                            onChange={(e) => setScrapeUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScrapeUrl()}
                            className="flex-1 h-9 text-sm"
                        />
                        <Button
                            size="sm"
                            onClick={handleScrapeUrl}
                            disabled={!scrapeUrl.trim() || isScraping}
                            className="h-9 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        >
                            {isScraping ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        Enter a company website or LinkedIn page to extract lead information
                    </p>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            {message.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm">{message.content}</p>
                            )}

                            {/* Action indicator */}
                            {message.action && ACTION_ICONS[message.action.type] && (
                                <div className={`flex items-center gap-1 mt-2 pt-2 border-t ${message.role === 'user' ? 'border-white/20' : 'border-gray-200 dark:border-gray-600'} text-xs opacity-80`}>
                                    <div className={`p-1 rounded ${message.role === 'user' ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                        {ACTION_ICONS[message.action.type].icon}
                                    </div>
                                    <span className="font-medium">{ACTION_ICONS[message.action.type].label}</span>
                                    {message.action.affectedRows && (
                                        <span className="opacity-70">({message.action.affectedRows.length} rows)</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                <span className="text-sm">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(suggestion.label)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-105"
                            >
                                {suggestion.icon}
                                {suggestion.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Spreadsheet info */}
            {spreadsheetData && (
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{spreadsheetData.name}</span>
                        <span>{spreadsheetData.leads.length} leads</span>
                    </div>
                </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-end gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your leads or describe changes..."
                        className="flex-1 min-h-[44px] max-h-[150px] resize-none rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                        rows={1}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="h-11 w-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-105"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
