"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
    Plus,
    ArrowUp,
    Globe,
    MoreHorizontal,
    BellRing,
    ChevronsUpDown,
    BadgeCheck,
    Bell,
    CreditCard,
    LogOut,
    Sparkles
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    ChatContainerContent,
    ChatContainerRoot,
} from "@/components/ui/chat-container";

import {
    Message,
    MessageContent,
} from "@/components/ui/message";

import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input";

import { ScrollButton } from "@/components/ui/scroll-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Types ---
type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
    isTyping?: boolean;
};

const mockUser = {
    name: "AI Lead Master",
    email: "pro@leadgen.ai",
    avatar: "https://github.com/shadcn.png",
};

// --- Components ---

function NavUser({ user }: { user: typeof mockUser }) {
    const { isMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="bg-sidebar-accent/50 hover:bg-sidebar-accent transition-all duration-300"
                        >
                            <Avatar className="h-8 w-8 rounded-lg border border-primary/20">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">AI</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1 shadow-xl animate-in fade-in zoom-in duration-200"
                        side={isMobile ? "bottom" : "right"}
                        align="start"
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="p-2 font-normal">
                            <div className="flex items-center gap-3 px-1 py-1 text-left text-sm">
                                <Avatar className="h-10 w-10 rounded-lg border border-primary/20">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">AI</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-base">{user.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-primary/10" />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer gap-2 transition-colors">
                                <Sparkles className="size-4" />
                                <span>Upgrade to Pro</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-primary/10" />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="focus:bg-primary/10 cursor-pointer gap-2">
                                <BadgeCheck className="size-4" />
                                <span>Account Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-primary/10 cursor-pointer gap-2">
                                <CreditCard className="size-4" />
                                <span>Billing History</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-primary/10 cursor-pointer gap-2">
                                <Bell className="size-4" />
                                <span>Notifications</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-primary/10" />
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer gap-2">
                            <LogOut className="size-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function ThinkingState() {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = [
        "Analyzing your request...",
        "Processing spreadsheet data...",
        "Generating intelligent insights...",
        "Updating your lead grid...",
        "Finalizing suggestions..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 py-2 px-3 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60"></span>
            </div>
            <span className="text-xs font-medium text-primary/80 tracking-tight italic">
                {messages[messageIndex]}
            </span>
        </div>
    );
}

// --- Main Component ---

export default function SidebarRight({
    data,
    setData,
    ...props
}: React.ComponentProps<typeof Sidebar> & { data?: any; setData?: any }) {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages, isLoading]);

    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading) return;

        const userText = prompt.trim();
        const userMessage: ChatMessage = {
            id: Date.now(),
            role: "user",
            content: userText,
        };

        const typingMessage: ChatMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: "",
            isTyping: true,
        };

        setChatMessages(prev => [...prev, userMessage, typingMessage]);
        setPrompt("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat-matrix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    spreadsheetData: data,
                }),
            });
            const result = await response.json();

            if (result.success) {
                if (result.updatedData && setData) setData(result.updatedData);
                setChatMessages(prev =>
                    prev.map(msg =>
                        msg.isTyping
                            ? {
                                id: Date.now() + 2,
                                role: "assistant",
                                content: result.response,
                            }
                            : msg
                    )
                );
            } else {
                throw new Error("Failed to get a response");
            }
        } catch (e) {
            setChatMessages(prev =>
                prev.map(msg =>
                    msg.isTyping
                        ? {
                            id: Date.now() + 2,
                            role: "assistant",
                            content: `Oops! I encountered an error. Please try again.`,
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleScrape = async () => {
        if (!prompt.trim() || isLoading) return;

        const searchQuery = prompt.trim();
        setChatMessages(prev => [
            ...prev,
            { id: Date.now(), role: "user", content: `Scrape web for leads matching: ${searchQuery}` },
            { id: Date.now() + 1, role: "assistant", content: "", isTyping: true }
        ]);
        setPrompt("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/leads/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });
            const result = await response.json();

            if (result.success && result.leads) {
                const newRows = result.leads.map((l: any) => [
                    { value: l.name },
                    { value: l.status },
                    { value: l.role },
                    { value: l.score },
                    { value: l.company },
                    { value: l.email },
                    { value: l.linkedin || l.website || "" }
                ]);

                if (setData && data) setData([...newRows, ...data]);

                setChatMessages(prev => prev.map(msg =>
                    msg.isTyping ? {
                        id: Date.now() + 2,
                        role: "assistant",
                        content: `✅ Success! I found ${result.leads.length} new leads for "${searchQuery}" and added them to your grid.`
                    } : msg
                ));
            } else {
                throw new Error("Failed to parse scraped leads.");
            }
        } catch (e) {
            setChatMessages(prev => prev.map(msg =>
                msg.isTyping ? {
                    id: Date.now() + 2,
                    role: "assistant",
                    content: `❌ Sorry, I hit a snag while scraping for leads.`
                } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeSignals = async () => {
        if (isLoading) return;

        setChatMessages(prev => [
            ...prev,
            { id: Date.now(), role: "user", content: `Analyze leads for intent buying signals.` },
            { id: Date.now() + 1, role: "assistant", content: "", isTyping: true }
        ]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat-matrix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Analyze the leads in my spreadsheet and detect 0-3 realistic buying intent signals for each one (e.g. recent funding, hiring, job change, website visit). Add a new column called 'Signals' containing your analysis.",
                    spreadsheetData: data,
                }),
            });
            const result = await response.json();

            if (result.success) {
                if (result.updatedData && setData) setData(result.updatedData);
                setChatMessages(prev => prev.map(msg =>
                    msg.isTyping ? { id: Date.now() + 2, role: "assistant", content: result.response } : msg
                ));
            }
        } catch (e) {
            setChatMessages(prev => prev.map(msg =>
                msg.isTyping ? { id: Date.now() + 2, role: "assistant", content: `Oops! Intent analysis failed. Please try again later.` } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sidebar
            collapsible="none"
            className="sticky top-0 hidden h-svh w-[380px] border-l lg:flex bg-background/50 backdrop-blur-xl shadow-[inset_1px_0_0_0_rgba(255,255,255,0.05)]"
            {...props}
        >
            <SidebarHeader className="h-20 border-b px-4 flex flex-col justify-center bg-gradient-to-b from-background to-background/80">
                <NavUser user={mockUser} />
            </SidebarHeader>

            <SidebarContent className="flex flex-col overflow-hidden bg-dot-white/[0.02]">
                {/* CHAT CONTAINER */}
                <div
                    ref={chatContainerRef}
                    className="relative flex-1 overflow-y-auto scroll-smooth py-4"
                >
                    <ChatContainerRoot className="h-full">
                        <ChatContainerContent className="px-5 space-y-6">
                            {chatMessages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-40 space-y-4 text-center px-8">
                                    <div className="p-4 rounded-full bg-primary/10">
                                        <Sparkles className="size-8 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium">Hello! I'm your AI Lead assistant. How can I help you grow your pipeline today?</p>
                                </div>
                            )}
                            {chatMessages.map(message => {
                                const isAssistant = message.role === "assistant";

                                return (
                                    <Message
                                        key={message.id}
                                        className={cn(
                                            "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                            isAssistant ? "justify-start" : "justify-end"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex flex-col gap-2 max-w-[90%]",
                                            isAssistant ? "items-start" : "items-end"
                                        )}>
                                            {/* @ts-ignore */}
                                            <MessageContent
                                                className={cn(
                                                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                    isAssistant
                                                        ? "bg-muted/30 text-foreground border border-border/50"
                                                        : "bg-primary text-primary-foreground font-medium"
                                                )}
                                            >
                                                {message.isTyping ? (
                                                    <ThinkingState />
                                                ) : (
                                                    <span className="leading-relaxed whitespace-pre-wrap">{message.content}</span>
                                                )}
                                            </MessageContent>
                                        </div>
                                    </Message>
                                );
                            })}
                        </ChatContainerContent>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                            <ScrollButton className="bg-background/80 backdrop-blur-sm border shadow-md hover:shadow-lg transition-all" />
                        </div>
                    </ChatContainerRoot>
                </div>

                {/* INPUT AREA */}
                <div className="p-4 bg-gradient-to-t from-background via-background to-transparent border-t">
                    <PromptInput
                        value={prompt}
                        isLoading={isLoading}
                        onValueChange={setPrompt}
                        onSubmit={handleSubmit}
                        className="rounded-[2rem] border bg-secondary/30 backdrop-blur-md shadow-inner transition-all duration-300 focus-within:ring-2 ring-primary/20 ring-offset-0 overflow-hidden"
                    >
                        <>
                            <PromptInputTextarea
                                placeholder="Scale your leads..."
                                disabled={isLoading}
                                className="
                                    bg-transparent
                                    focus:bg-transparent
                                    disabled:bg-transparent
                                    border-0
                                    shadow-none
                                    outline-none
                                    ring-0
                                    focus:ring-0
                                    focus-visible:ring-0
                                    text-sm
                                    text-foreground
                                    placeholder:text-muted-foreground/60
                                    resize-none
                                    px-6
                                    pt-4
                                    min-h-[60px]
                                "
                            />

                            <PromptInputActions className="flex justify-between items-center px-4 pb-3 mt-1">
                                <div className="flex items-center gap-2">
                                    <PromptInputAction tooltip="Scrape web for leads">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full h-8 bg-background/50 hover:bg-primary/10 hover:text-primary border border-border/50 text-xs px-3"
                                            onClick={handleScrape}
                                            disabled={isLoading || !prompt.trim()}
                                        >
                                            <Globe size={14} className="mr-1.5" />
                                            Scrape
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="Detect buyer intent">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full h-8 bg-background/50 hover:bg-primary/10 hover:text-primary border border-border/50 text-xs px-3"
                                            onClick={handleAnalyzeSignals}
                                            disabled={isLoading}
                                        >
                                            <BellRing size={14} className="mr-1.5" />
                                            Signals
                                        </Button>
                                    </PromptInputAction>
                                </div>

                                <div className="flex items-center">
                                    <Button
                                        size="icon"
                                        disabled={!prompt.trim() || isLoading}
                                        onClick={handleSubmit}
                                        className={cn(
                                            "size-9 rounded-full shadow-lg transition-all duration-300 transform",
                                            !prompt.trim() || isLoading ? "scale-90 opacity-50" : "scale-100 opacity-100 hover:scale-105"
                                        )}
                                    >
                                        {!isLoading ? (
                                            <ArrowUp size={18} />
                                        ) : (
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                        )}
                                    </Button>
                                </div>
                            </PromptInputActions>
                        </>
                    </PromptInput>
                    <p className="text-[10px] text-center text-muted-foreground/40 mt-3 font-medium tracking-widest uppercase">
                        AI Lead Logic Engine v1.0
                    </p>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}
