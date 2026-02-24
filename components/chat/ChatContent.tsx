"use client"

import {
    ChatContainerContent,
    ChatContainerRoot,
} from "@/components/ui/chat-container";
import {
    Message,
    MessageAction,
    MessageActions,
    MessageContent,
    MessageAvatar,
} from "@/components/ui/message";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { ScrollButton } from "@/components/ui/scroll-button"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";
import {
    ArrowUp,
    CheckCircle2,
    Copy,
    Filter,
    Globe,
    Loader2,
    Mic,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    SortDesc,
    ThumbsDown,
    ThumbsUp,
    Trash,
    Zap,
} from "lucide-react"
import { useState } from "react"
import { TextShimmer } from "@/components/ui/text-shimmer";
import {
    Source,
    SourceContent,
    SourceTrigger,
} from "@/components/ui/source";
import {
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtItem,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
} from "@/components/ui/chain-of-thought"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ui/reasoning";
import { DotsLoader } from "@/components/ui/loader";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from 'ai';
import { Tool } from "@/components/ui/tool";
import {
    Confirmation,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationTitle,
    ConfirmationRequest,
    ConfirmationAccepted,
    ConfirmationRejected,
} from "@/components/ai-elements/confirmation";

// — Reasoning step icon resolver —
function StepIcon({ icon, done }: { icon: string; done: boolean }) {
    if (done) return <CheckCircle2 className="size-4 text-green-500 shrink-0" />;
    switch (icon) {
        case 'search': return <Search className="size-4 shrink-0" />;
        case 'analyze': return <Zap className="size-4 shrink-0" />;
        case 'filter': return <Filter className="size-4 shrink-0" />;
        case 'rank': return <SortDesc className="size-4 shrink-0" />;
        default: return <Loader2 className="size-4 shrink-0 animate-spin" />;
    }
}

// — Default suggestions before any conversation —
const DEFAULT_SUGGESTIONS = [
    'Find me top SaaS leads in the US with 50–200 employees',
    'What are the best signals to identify hot leads?',
    'Draft a cold email for a fintech Series A company',
];

export default function ChatContent() {
    const [confirmationResponses, setConfirmationResponses] = useState<Record<string, 'approved' | 'rejected'>>({});
    const {
        messages,
        sendMessage,
        status,
    } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/message',
        }),
    });

    const isLoading = status === 'streaming' || status === 'submitted';
    const [inputValue, setInputValue] = useState("")

    const handleSubmit = () => {
        if (!inputValue.trim() || isLoading) return;
        sendMessage({ text: inputValue.trim() });
        setInputValue("");
    };

    // Derive suggestions: from last assistant message's data-suggestions part, or defaults
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    const suggestionsPart = lastAssistant?.parts?.find(
        (p: any) => p.type === 'data-suggestions'
    ) as { type: string; data: { suggestions: string[] } } | undefined;

    const activeSuggestions =
        !isLoading && suggestionsPart?.data?.suggestions?.length
            ? suggestionsPart.data.suggestions
            : !isLoading && messages.length === 0
                ? DEFAULT_SUGGESTIONS
                : [];

    return (
        <main className="flex w-1/2 h-screen flex-col overflow-hidden">
            <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="text-foreground">Lead Research Chat</div>
            </header>

            <div className="relative flex-1 overflow-y-auto">
                <ChatContainerRoot className="h-full">
                    <ChatContainerContent className="space-y-0 px-5 py-12">
                        {messages.map((message, index) => {
                            const isAssistant = message.role === "assistant"
                            const isLastMessage = index === messages.length - 1
                            const isThisStreaming = isLastMessage && status === 'streaming';

                            // Pull typed parts from message.parts.
                            // SDK deduplicates by id+type, so each step appears once and is updated in-place.
                            const baseReasoningSteps = message.parts
                                .filter((p: any) => p.type === 'data-reasoning-step')
                                .map((p: any) => p.data as {
                                    index: number;
                                    icon: string;
                                    label: string;
                                    done: boolean;
                                    subtext?: string;
                                })
                                .sort((a: any, b: any) => a.index - b.index);

                            // Add dummy steps for demonstration if needed
                            const reasoningSteps = baseReasoningSteps.length > 0 ? baseReasoningSteps : (isAssistant ? [
                                { index: 0, icon: 'search', label: 'Querying CRM for matching contacts...', done: true, subtext: 'Searching through 5,000+ records in Salesforce' },
                                { index: 1, icon: 'analyze', label: 'Cross-referencing with LinkedIn data...', done: true, subtext: 'Verified 12 recent job changes' },
                                { index: 2, icon: 'filter', label: 'Applying intent signal filters...', done: true, subtext: 'Filtered for "High Intent" signals in last 30 days' },
                                { index: 3, icon: 'search', label: 'Scanning news for recent triggers...', done: true, subtext: 'Found 3 companies with recent funding rounds' },
                                { index: 4, icon: 'analyze', label: 'Mapping personas to decision makers...', done: true, subtext: 'Identified 8 VPs of Sales and 5 Heads of Growth' },
                                { index: 5, icon: 'rank', label: 'Generating outreach recommendations...', done: true, subtext: 'Prioritized top 5 leads based on fit score' }
                            ] : []);

                            const toolApprovalPart = message.parts.find((p: any) => p.type === 'tool-approval') as any;
                            const userChoice = confirmationResponses[message.id];
                            const isPendingConfirmation = isAssistant && isLastMessage && !userChoice && !isLoading;

                            const sourceParts = message.parts.filter(
                                (p: any) => p.type === 'source-url'
                            ) as Array<{ type: string; sourceId: string; url: string; title?: string }>;

                            const textContent = message.parts
                                .filter((p: any) => p.type === 'text')
                                .map((p: any) => p.text)
                                .join('');

                            return (
                                <Message
                                    key={message.id}
                                    className={cn(
                                        "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                                        isAssistant ? "items-start" : "items-end"
                                    )}
                                >
                                    {isAssistant ? (
                                        <div className="group flex w-full flex-col gap-0">

                                            {/* Dots loader: waiting for server response */}
                                            {isLastMessage && status === 'submitted' && (
                                                <DotsLoader />
                                            )}

                                            {/* Live chain-of-thought reasoning steps */}
                                            {reasoningSteps.length > 0 && (
                                                <Reasoning
                                                    isStreaming={isThisStreaming && reasoningSteps.some(s => !s.done)}
                                                    className="mb-3"
                                                >
                                                    <ReasoningTrigger className="text-sm">
                                                        {isThisStreaming && reasoningSteps.some(s => !s.done) ? (
                                                            <TextShimmer className="text-sm">Reasoning...</TextShimmer>
                                                        ) : (
                                                            <span className="text-muted-foreground">View reasoning steps</span>
                                                        )}
                                                    </ReasoningTrigger>
                                                    <ReasoningContent className="mt-2 ml-1">
                                                        <ChainOfThought>
                                                            {reasoningSteps.map((step, i) => (
                                                                <ChainOfThoughtStep key={i} defaultOpen>
                                                                    <ChainOfThoughtTrigger
                                                                        leftIcon={
                                                                            <StepIcon icon={step.icon} done={step.done} />
                                                                        }
                                                                    >
                                                                        <span className={cn(
                                                                            "transition-colors",
                                                                            step.done
                                                                                ? "text-foreground"
                                                                                : "text-muted-foreground"
                                                                        )}>
                                                                            {step.label}
                                                                        </span>
                                                                        {!step.done && i === reasoningSteps.length - 1 && (
                                                                            <Loader2 className="ml-2 size-3 animate-spin inline shrink-0" />
                                                                        )}
                                                                    </ChainOfThoughtTrigger>
                                                                    <ChainOfThoughtContent>
                                                                        <ChainOfThoughtItem>
                                                                            <div className="flex flex-col gap-1">
                                                                                <div className="text-sm font-medium">
                                                                                    {step.done ? "✓ Completed" : "In progress..."}
                                                                                </div>
                                                                                {step.subtext && (
                                                                                    <div className="text-xs text-muted-foreground">
                                                                                        {step.subtext}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </ChainOfThoughtItem>
                                                                        <Tool
                                                                            className="w-full mt-2 mb-3 max-w-md"
                                                                            toolPart={{
                                                                                type: "search_web",
                                                                                state: "output-available",
                                                                                input: {
                                                                                    query: step.label,
                                                                                    max_results: 5,
                                                                                },
                                                                                output: {
                                                                                    results: [
                                                                                        {
                                                                                            title: `${step.label} Results`,
                                                                                            url: "https://example.com/search",
                                                                                            snippet: `Found relevant data for: ${step.label}...`,
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            }}
                                                                        />
                                                                    </ChainOfThoughtContent>
                                                                </ChainOfThoughtStep>
                                                            ))}
                                                        </ChainOfThought>
                                                    </ReasoningContent>
                                                </Reasoning>
                                            )}

                                            {/* Confirmation block - Gating the flow */}
                                            {isAssistant && isLastMessage && (
                                                <Confirmation
                                                    state={userChoice ? "approval-responded" : "approval-requested"}
                                                    approval={{
                                                        id: "research-move-ahead",
                                                        approved: userChoice === 'approved'
                                                    }}
                                                    className="mb-4 max-w-md"
                                                >
                                                    <ConfirmationTitle>
                                                        Do you want me to proceed with the outreach drafting?
                                                    </ConfirmationTitle>
                                                    <ConfirmationRequest>
                                                        <ConfirmationActions>
                                                            <ConfirmationAction
                                                                variant="outline"
                                                                onClick={() => setConfirmationResponses(prev => ({ ...prev, [message.id]: 'rejected' }))}
                                                            >
                                                                No, show output
                                                            </ConfirmationAction>
                                                            <ConfirmationAction
                                                                onClick={() => setConfirmationResponses(prev => ({ ...prev, [message.id]: 'approved' }))}
                                                            >
                                                                Yes, continue
                                                            </ConfirmationAction>
                                                        </ConfirmationActions>
                                                    </ConfirmationRequest>
                                                    <ConfirmationAccepted>
                                                        <div className="text-sm text-green-600 dark:text-green-400">
                                                            Permission granted. Proceeding with analysis...
                                                        </div>
                                                    </ConfirmationAccepted>
                                                    <ConfirmationRejected>
                                                        <div className="text-sm text-red-600 dark:text-red-400">
                                                            Permission denied. Showing direct market summary.
                                                        </div>
                                                    </ConfirmationRejected>
                                                </Confirmation>
                                            )}

                                            {/* Main response (markdown) - Hidden while pending confirmation */}
                                            {!isPendingConfirmation && (
                                                <>
                                                    <MessageContent
                                                        className="text-foreground flex-1 rounded-lg bg-transparent p-0 prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs dark:prose-invert"
                                                        markdown={true}
                                                    >
                                                        {textContent}
                                                    </MessageContent>

                                                    {/* Sources */}
                                                    {sourceParts.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {sourceParts.map((src) => (
                                                                <Source key={src.sourceId} href={src.url}>
                                                                    <SourceTrigger showFavicon />
                                                                    <SourceContent
                                                                        title={src.title ?? new URL(src.url).hostname}
                                                                        description={src.url}
                                                                    />
                                                                </Source>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            <MessageActions
                                                className={cn(
                                                    "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                                                    isLastMessage && !isLoading && !isPendingConfirmation && "opacity-100"
                                                )}
                                            >
                                                <MessageAction tooltip="Copy" delayDuration={100}>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <Copy />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Upvote" delayDuration={100}>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <ThumbsUp />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Downvote" delayDuration={100}>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <ThumbsDown />
                                                    </Button>
                                                </MessageAction>
                                            </MessageActions>
                                        </div>
                                    ) : (
                                        <div className="group flex flex-col items-end gap-1">
                                            <MessageAvatar
                                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGEZghB-stFaphAohNqDAhEaXOWQJ9XvHKJw&s"
                                                alt="User"
                                                fallback="U"
                                            />
                                            <MessageContent className="bg-muted text-primary max-w-[100%] rounded-3xl px-5 py-2.5">
                                                {textContent}
                                            </MessageContent>

                                            <MessageActions className="flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                                                <MessageAction tooltip="Edit" delayDuration={100}>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <Pencil />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Delete" delayDuration={100}>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <Trash />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Copy" delayDuration={100}>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <Copy />
                                                    </Button>
                                                </MessageAction>
                                            </MessageActions>
                                        </div>
                                    )}
                                </Message>
                            )
                        })}
                    </ChatContainerContent>
                    <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
                        <ScrollButton className="shadow-sm" />
                    </div>
                </ChatContainerRoot>
            </div>

            <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
                <div className="mx-auto max-w-3xl">

                    {/* Context-aware suggestions — visible when idle */}
                    {activeSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-1 py-2 mb-2">
                            {activeSuggestions.map((s, i) => (
                                <PromptSuggestion
                                    key={i}
                                    onClick={() => setInputValue(s)}
                                    className="flex-1 min-w-[160px] max-w-[280px] text-xs"
                                >
                                    <span className="block truncate" title={s}>{s}</span>
                                </PromptSuggestion>
                            ))}
                        </div>
                    )}

                    <PromptInput
                        isLoading={isLoading}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onSubmit={handleSubmit}
                        className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
                    >
                        <div className="flex flex-col">
                            <PromptInputTextarea
                                placeholder="Ask anything about your leads..."
                                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                            />

                            <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                                <div className="flex items-center gap-2">
                                    <PromptInputAction tooltip="Add attachment">
                                        <Button variant="outline" size="icon" className="size-9 rounded-full">
                                            <Plus size={18} />
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="Search web">
                                        <Button variant="outline" className="rounded-full">
                                            <Globe size={18} />
                                            Search
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="More actions">
                                        <Button variant="outline" size="icon" className="size-9 rounded-full">
                                            <MoreHorizontal size={18} />
                                        </Button>
                                    </PromptInputAction>
                                </div>

                                <div className="flex items-center gap-2">
                                    <PromptInputAction tooltip="Voice input">
                                        <Button variant="outline" size="icon" className="size-9 rounded-full">
                                            <Mic size={18} />
                                        </Button>
                                    </PromptInputAction>

                                    <Button
                                        size="icon"
                                        disabled={!inputValue.trim() || isLoading}
                                        onClick={handleSubmit}
                                        className="size-9 rounded-full"
                                    >
                                        {!isLoading ? (
                                            <ArrowUp size={18} />
                                        ) : (
                                            <span className="size-3 rounded-xs bg-white" />
                                        )}
                                    </Button>
                                </div>
                            </PromptInputActions>
                        </div>
                    </PromptInput>
                </div>
            </div>
        </main>
    )
}
