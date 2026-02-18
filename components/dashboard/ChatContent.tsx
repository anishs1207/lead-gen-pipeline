"use client"

import {
    ChatContainerContent,
    ChatContainerRoot,
} from "@/components/ui/chat-container";
import { Loader, Search } from "lucide-react";
// import { Markdown } from "@/components/ui/markdown"
import { Tool } from "@/components/ui/tool"
import {
    Message,
    MessageAction,
    MessageActions,
    MessageContent,
    MessageAvatar
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
import {
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";
import {
    ArrowUp,
    Copy,
    Globe,
    Mic,
    MoreHorizontal,
    Pencil,
    Plus,
    PlusIcon,
    ThumbsDown,
    ThumbsUp,
    Trash,
} from "lucide-react"
import { useRef, useState } from "react"
import NavUser from "./NavUser";
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
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block"
import { Lightbulb, Target } from "lucide-react";
import { FeedbackBar } from "@/components/ui/feedback-bar"
import { Info } from "lucide-react"
import callMCPServer from "@/utils/callMCPServer";
import axios from "axios";
import { DotsLoader } from "../ui/loader";
import {
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
} from "@/components/ui/reasoning"

///@@ made the siggestions scroll sideyways here

// Simulated streaming function with markdown content
const simulateMarkdownStream = async (
    setText: (text: string) => void,
    setIsStreaming: (streaming: boolean) => void
) => {
    const reasoning = `# Solving: Square Root of 144

## Step 1: Problem Analysis
I need to find a number that, when **multiplied by itself**, equals 144.

## Step 2: Testing Values
- \`10² = 100\` ❌ (too small)
- \`13² = 169\` ❌ (too large) 
- \`12² = 144\` ✅ (perfect!)

## Step 3: Verification
\`\`\`
12 × 12 = 144 ✓
\`\`\`

> **Answer:** The square root of 144 is **12**.`

    setIsStreaming(true)
    setText("")

    // Simulate character-by-character streaming
    for (let i = 0; i <= reasoning.length; i++) {
        setText(reasoning.slice(0, i))
        await new Promise((resolve) => setTimeout(resolve, 20))
    }

    setIsStreaming(false)
}

export function ReasoningMarkdown() {
    const [reasoningText, setReasoningText] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)

    const handleGenerateReasoning = () => {
        simulateMarkdownStream(setReasoningText, setIsStreaming)
    }

    return (
        <div className="flex w-full flex-col items-start gap-4">
            <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateReasoning}
                disabled={isStreaming}
            >
                {isStreaming ? "Thinking..." : "Generate Reasoning"}
            </Button>

            <Reasoning isStreaming={isStreaming}>
                <ReasoningTrigger>Show AI reasoning</ReasoningTrigger>
                <ReasoningContent
                    markdown
                    className="ml-2 border-l-2 border-l-slate-200 px-2 pb-1 dark:border-l-slate-700"
                >
                    {reasoningText}
                </ReasoningContent>
            </Reasoning>
        </div>
    )
}

import {
    Confirmation,
    ConfirmationAccepted,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRejected,
    ConfirmationRequest,
    ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import { CheckIcon, XIcon } from "lucide-react";
import { nanoid } from "nanoid";

const handleReject = () => {
    // In production, call respondToConfirmationRequest with approved: false
};

const handleApprove = () => {
    // In production, call respondToConfirmationRequest with approved: true
};

const Example = () => (
    <div className="w-full max-w-2xl mb-4">
        <Confirmation approval={{ id: nanoid() }} state="approval-requested">
            <ConfirmationTitle>
                <ConfirmationRequest>
                    This tool wants to delete the file{" "}
                    <code className="inline rounded bg-muted px-1.5 py-0.5 text-sm">
                        /tmp/example.txt
                    </code>
                    . Do you approve this action?
                </ConfirmationRequest>
                <ConfirmationAccepted>
                    <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
                    <span>You approved this tool execution</span>
                </ConfirmationAccepted>
                <ConfirmationRejected>
                    <XIcon className="size-4 text-destructive" />
                    <span>You rejected this tool execution</span>
                </ConfirmationRejected>
            </ConfirmationTitle>
            <ConfirmationActions>
                <ConfirmationAction onClick={handleReject} variant="outline">
                    Reject
                </ConfirmationAction>
                <ConfirmationAction onClick={handleApprove} variant="default">
                    Approve
                </ConfirmationAction>
            </ConfirmationActions>
        </Confirmation>
    </div>
);

// fix markdwon (right now its not working)
const markdownContent = `
# Markdown Example

This is a **bold text** and this is an *italic text*.

## Lists

### Unordered List
- Item 1
- Item 2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Links and Images

[Visit Prompt Kit](https://prompt-kit.com)

## Code

Inline \`code\` example.

\`\`\`javascript
// Code block example
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`
`

const initialMessages = [
    {
        id: 1,
        role: "user",
        content: "Hello! Can you help me with a coding question?",
    },
    {
        id: 2,
        role: "assistant",
        content: "Of course! I'd be happy to help. What are you working on?",
    },
    {
        id: 3,
        role: "user",
        content: "How do I create a responsive layout using CSS Grid?",
    },
    {
        id: 4,
        role: "assistant",
        content:
            "You can use `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` to create a responsive grid that adapts to screen size.",
    },
    {
        id: 5,
        role: "user",
        content: "What’s the difference between Flexbox and Grid?",
    },
    {
        id: 6,
        role: "assistant",
        content:
            "Flexbox is one-dimensional (row OR column), while Grid is two-dimensional (rows AND columns). Grid is better for page layouts.",
    },
    {
        id: 7,
        role: "user",
        content: "When should I prefer Grid over Flexbox?",
    },
    {
        id: 8,
        role: "assistant",
        content:
            "Use Grid for complex layouts (dashboards, pages) and Flexbox for smaller UI components like navbars or cards.",
    },
    {
        id: 9,
        role: "user",
        content: "Can CSS Grid be used for mobile layouts?",
    },
    {
        id: 10,
        role: "assistant",
        content: markdownContent
    },
    {
        id: 11,
        role: "user",
        content: "Do you have a simple Grid example?",
    },
    {
        id: 12,
        role: "assistant",
        content:
            "Sure! A basic grid looks like this:\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 16px;\n}\n```",
    },
];

// calling the mcp server in the backend /seerver here:

export default function ChatContent({ data, setData }: any) {
    const [prompt, setPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [chatMessages, setChatMessages] = useState(initialMessages)
    const chatContainerRef = useRef<HTMLDivElement>(null)

    const [inputValue, setInputValue] = useState("")

    const handleSend = () => {
        if (inputValue.trim()) {
            console.log("Sending:", inputValue)
            setInputValue("")
        }
    }

    const handleSubmit = async () => {
        if (!prompt.trim()) return

        setPrompt("")
        setIsLoading(true)

        // Add user message immediately
        const newUserMessage = {
            id: chatMessages.length + 1,
            role: "user",
            content: prompt.trim(),
        }

        setChatMessages((prev) => [...prev, newUserMessage]);

        if (!prompt.trim()) return;

        // const res: any = await axios.post("/api/call-mcp", {
        //     prompt: prompt.trim(),
        // });

        const response = await axios.get

        const assistantResponse = {
            id: chatMessages.length + 2,
            role: "assistant",
            content: res.data.response || "Error generating response",
        }

        setChatMessages((prev) => [...prev, assistantResponse]);

        setIsLoading(false);
    }


    return (
        <main className="flex w-1/2 h-screen flex-col overflow-hidden">
            <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="text-foreground">Project roadmap discussion</div>
            </header>

            <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
                <ChatContainerRoot className="h-full">
                    <ChatContainerContent className="space-y-0 px-5 py-12">
                        {chatMessages.map((message, index) => {
                            const isAssistant = message.role === "assistant"
                            const isLastMessage = index === chatMessages.length - 1

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
                                            <TextShimmer className="text-sm mb-2">Loading...</TextShimmer>

                                            <DotsLoader />

                                            <ReasoningMarkdown />


                                            <div className="w-full max-w-3xl">
                                                <ChainOfThought>
                                                    <ChainOfThoughtStep>
                                                        <ChainOfThoughtTrigger leftIcon={<Search className="size-4" />}>
                                                            Research phase: Understanding the problem space
                                                        </ChainOfThoughtTrigger>
                                                        <ChainOfThoughtContent>
                                                            <ChainOfThoughtItem>
                                                                The problem involves   <Source href="https://ibelick.com">
                                                                    <SourceTrigger showFavicon />
                                                                    <SourceContent
                                                                        title="Ibelick"
                                                                        description="Julien Thibeaut (@Ibelick). Design Engineer passionate about crafting beautiful, functional interfaces and tools."
                                                                    />
                                                                </Source> optimizing database queries for a
                                                                high-traffic e-commerce platform
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                Current bottlenecks:  <Source href="https://ibelick.com">
                                                                    <SourceTrigger showFavicon />
                                                                    <SourceContent
                                                                        title="Ibelick"
                                                                        description="Julien Thibeaut (@Ibelick). Design Engineer passionate about crafting beautiful, functional interfaces and tools."
                                                                    />
                                                                </Source> slow product search (2-3 seconds), category
                                                                filtering delays
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                Database: PostgreSQL with 10M+ products, complex joins across
                                                                multiple tables   <Source href="https://ibelick.com">
                                                                    <SourceTrigger showFavicon />
                                                                    <SourceContent
                                                                        title="Ibelick"
                                                                        description="Julien Thibeaut (@Ibelick). Design Engineer passionate about crafting beautiful, functional interfaces and tools."
                                                                    />
                                                                </Source>
                                                            </ChainOfThoughtItem>
                                                        </ChainOfThoughtContent>
                                                    </ChainOfThoughtStep>

                                                    <Example />

                                                    <Tool
                                                        className="w-full mt-0 mb-3 max-w-md"
                                                        toolPart={{
                                                            type: "search_web",
                                                            state: "output-available",
                                                            input: {
                                                                query: "prompt-kit documentation",
                                                                max_results: 5,
                                                            },
                                                            output: {
                                                                results: [
                                                                    {
                                                                        title: "Prompt Kit - Documentation",
                                                                        url: "https://prompt-kit.com/docs",
                                                                        snippet:
                                                                            "A comprehensive guide to using Prompt Kit components...",
                                                                    },
                                                                    {
                                                                        title: "Getting Started with Prompt Kit",
                                                                        url: "https://prompt-kit.com/docs/installation",
                                                                        snippet:
                                                                            "Learn how to install and use Prompt Kit in your project...",
                                                                    },
                                                                ],
                                                            },
                                                        }}
                                                    />

                                                    <ChainOfThoughtStep>
                                                        <ChainOfThoughtTrigger leftIcon={<Lightbulb className="size-4" />}>
                                                            Analysis: Identifying optimization opportunities
                                                        </ChainOfThoughtTrigger>
                                                        <ChainOfThoughtContent>
                                                            <ChainOfThoughtItem>
                                                                Missing indexes on frequently queried columns (product_name,
                                                                category_id, price_range)
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                N+1 query problem in product listing API - need eager loading
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                Full table scans occurring due to non-optimized WHERE clauses
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                Consider implementing database partitioning for better performance
                                                            </ChainOfThoughtItem>
                                                        </ChainOfThoughtContent>
                                                    </ChainOfThoughtStep>

                                                    <Tool
                                                        className="w-full mt-0 mb-3 max-w-md"
                                                        toolPart={{
                                                            type: "search_web",
                                                            state: "output-available",
                                                            input: {
                                                                query: "prompt-kit documentation",
                                                                max_results: 5,
                                                            },
                                                            output: {
                                                                results: [
                                                                    {
                                                                        title: "Prompt Kit - Documentation",
                                                                        url: "https://prompt-kit.com/docs",
                                                                        snippet:
                                                                            "A comprehensive guide to using Prompt Kit components...",
                                                                    },
                                                                    {
                                                                        title: "Getting Started with Prompt Kit",
                                                                        url: "https://prompt-kit.com/docs/installation",
                                                                        snippet:
                                                                            "Learn how to install and use Prompt Kit in your project...",
                                                                    },
                                                                ],
                                                            },
                                                        }}
                                                    />

                                                    <ChainOfThoughtStep>
                                                        <ChainOfThoughtTrigger leftIcon={<Target className="size-4" />}>
                                                            Solution: Implementing targeted improvements
                                                        </ChainOfThoughtTrigger>
                                                        <ChainOfThoughtContent>
                                                            <ChainOfThoughtItem>
                                                                <strong>Step 1:</strong> Add composite indexes for common query
                                                                patterns
                                                                <CodeBlock className="mt-2">
                                                                    <CodeBlockCode
                                                                        code={`CREATE INDEX CONCURRENTLY idx_products_search
ON products (category_id, price, rating DESC)
WHERE active = true;`}
                                                                        language="sql"
                                                                    />
                                                                </CodeBlock>
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                <strong>Step 2:</strong> Optimize ORM queries with eager loading
                                                                <CodeBlock className="mt-2">
                                                                    <CodeBlockCode
                                                                        code={`// Before: N+1 queries
products.map(p => p.category.name)

// After: Single query with joins
Product.findAll({
  include: [{ model: Category, as: 'category' }]
})`}
                                                                        language="javascript"
                                                                    />
                                                                </CodeBlock>
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                <strong>Step 3:</strong> Implement query result caching for
                                                                popular searches
                                                            </ChainOfThoughtItem>
                                                        </ChainOfThoughtContent>
                                                    </ChainOfThoughtStep>
                                                    <ChainOfThoughtStep>
                                                        <ChainOfThoughtTrigger leftIcon={<Search className="size-4" />}>
                                                            Solution: Implementing targeted improvements
                                                        </ChainOfThoughtTrigger>
                                                        <ChainOfThoughtContent>
                                                            <ChainOfThoughtItem>
                                                                <strong>Step 1:</strong> Add composite indexes for common query
                                                                patterns
                                                                <CodeBlock className="mt-2">
                                                                    <CodeBlockCode
                                                                        code={`CREATE INDEX CONCURRENTLY idx_products_search
ON products (category_id, price, rating DESC)
WHERE active = true;`}
                                                                        language="sql"
                                                                    />
                                                                </CodeBlock>
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                <strong>Step 2:</strong> Optimize ORM queries with eager loading
                                                                <CodeBlock className="mt-2">
                                                                    <CodeBlockCode
                                                                        code={`// Before: N+1 queries
products.map(p => p.category.name)

// After: Single query with joins
Product.findAll({
  include: [{ model: Category, as: 'category' }]
})`}
                                                                        language="javascript"
                                                                    />
                                                                </CodeBlock>
                                                            </ChainOfThoughtItem>
                                                            <ChainOfThoughtItem>
                                                                <strong>Step 3:</strong> Implement query result caching for
                                                                popular searches
                                                            </ChainOfThoughtItem>
                                                        </ChainOfThoughtContent>
                                                    </ChainOfThoughtStep>



                                                </ChainOfThought>
                                                <div className="flex w-full flex-col justify-center space-y-2 mt-2 mb-4">
                                                    <Tool
                                                        className="w-full max-w-md"
                                                        toolPart={{
                                                            type: "file_search",
                                                            state: "input-streaming",
                                                            input: {
                                                                pattern: "*.tsx",
                                                                directory: "/components",
                                                            },
                                                        }}
                                                    />
                                                    <Tool
                                                        className="w-full max-w-md"
                                                        toolPart={{
                                                            type: "api_call",
                                                            state: "input-available",
                                                            input: {
                                                                endpoint: "/api/users",
                                                                method: "GET",
                                                            },
                                                        }}
                                                    />
                                                    <Tool
                                                        className="w-full max-w-md"
                                                        toolPart={{
                                                            type: "database_query",
                                                            state: "output-available",
                                                            input: {
                                                                table: "users",
                                                                limit: 10,
                                                            },
                                                            output: {
                                                                count: 42,
                                                                data: [
                                                                    { id: 1, name: "John Doe" },
                                                                    { id: 2, name: "Jane Smith" },
                                                                ],
                                                            },
                                                        }}
                                                    />

                                                    <Tool
                                                        className="w-full max-w-md"
                                                        toolPart={{
                                                            type: "email_send",
                                                            state: "output-error",
                                                            output: {
                                                                to: "user@example.com",
                                                                subject: "Welcome!",
                                                            },
                                                            errorText: "Failed to connect to SMTP server",
                                                        }}
                                                    />
                                                </div>

                                            </div>
                                            {/* <div className="mb-5"></div> */}

                                            <MessageAvatar src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGEZghB-stFaphAohNqDAhEaXOWQJ9XvHKJw&s" alt="AI" fallback="AI" />

                                            <MessageContent
                                                className="text-foreground flex-1 rounded-lg bg-transparent p-0 prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs dark:prose-invert"
                                                markdown={true}
                                            >
                                                {message.content}
                                            </MessageContent>

                                            <div className="grid gap-4 mt-2 
                grid-cols-1 
                sm:grid-cols-2 
                md:grid-cols-3 
                lg:grid-cols-4 
                xl:grid-cols-5">
                                                <Source href="https://ibelick.com">
                                                    <SourceTrigger showFavicon />
                                                    <SourceContent
                                                        title="Ibelick"
                                                        description="Julien Thibeaut (@Ibelick). Design Engineer passionate about crafting beautiful, functional interfaces and tools."
                                                    />
                                                </Source>

                                                <Source href="https://www.google.com">
                                                    <SourceTrigger showFavicon />
                                                    <SourceContent
                                                        title="Google"
                                                        description="Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for."
                                                    />
                                                </Source>

                                                <Source href="https://www.figma.com">
                                                    <SourceTrigger showFavicon />
                                                    <SourceContent
                                                        title="Figma"
                                                        description="Figma is the leading collaborative design tool for building meaningful products. Seamlessly design, prototype, develop, and collect feedback in a single platform."
                                                    />
                                                </Source>

                                                <Source href="https://github.com/ibelick/prompt-kit">
                                                    <SourceTrigger showFavicon />
                                                    <SourceContent
                                                        title="Core building blocks for AI apps. High-quality, accessible, and customizable components for AI interfaces."
                                                        description="Customizable, high-quality components for AI applications. Build chat experiences, AI agents, autonomous assistants, and more, quickly and beautifully."
                                                    />
                                                </Source>

                                                <Source href="https://www.wikipedia.org">
                                                    <SourceTrigger showFavicon />
                                                    <SourceContent
                                                        title="Wikipedia"
                                                        description="Welcome to Wikipedia, the free encyclopedia that anyone can edit. 107,267 active editors; 7,034,015 articles in English."
                                                    />
                                                </Source>
                                            </div>


                                            <MessageActions
                                                className={cn(
                                                    "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                                                    isLastMessage && "opacity-100"
                                                )}
                                            >
                                                <MessageAction tooltip="Copy" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <Copy />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Upvote" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <ThumbsUp />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Downvote" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <ThumbsDown />
                                                    </Button>
                                                </MessageAction>

                                            </MessageActions>

                                            <div className="flex w-full max-w-sm flex-col gap-4 mb-4">
                                                <FeedbackBar
                                                    title="Was this response helpful?"
                                                    icon={<Info className="text-primary size-4" />}
                                                    onHelpful={() => console.log("helpful")}
                                                    onNotHelpful={() => console.log("not helpful")}
                                                    onClose={() => console.log("close")}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group flex flex-col items-end gap-1">
                                            <MessageAvatar src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGEZghB-stFaphAohNqDAhEaXOWQJ9XvHKJw&s" alt="AI" fallback="AI" />

                                            <MessageContent className="bg-muted text-primary max-w-[100%] rounded-3xl px-5 py-2.5 ">
                                                {message.content}
                                            </MessageContent>

                                            <MessageActions
                                                className={cn(
                                                    "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                                )}
                                            >
                                                <MessageAction tooltip="Edit" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Delete" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <Trash />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Copy" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
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
                    <div className="flex flex-wrap gap-2 px-1 py-2 mb-2">
                        <PromptSuggestion
                            onClick={() => setInputValue("Tell me a joke")}
                            className="flex-1 min-w-[150px] max-w-[300px]"
                        >
                            <span className="block truncate" title="Try previewing https://www.wikipedia.org to see a live page.">
                                Try previewing https://www.wikipedia.org to see a live page.
                            </span>
                        </PromptSuggestion>

                        <PromptSuggestion
                            onClick={() => setInputValue("How does this work?")}
                            className="flex-1 min-w-[150px] max-w-[300px]"
                        >
                            <span className="block truncate" title="Check out https://news.ycombinator.com for tech news previews.">
                                Check out https://news.ycombinator.com for tech news previews.
                            </span>
                        </PromptSuggestion>

                        <PromptSuggestion
                            onClick={() => setInputValue("How does this work?")}
                            className="flex-1 min-w-[150px] max-w-[300px]"
                        >
                            <span className="block truncate" title="Want to see a product page? Try https://www.amazon.in.">
                                Want to see a product page? Try https://www.amazon.in.
                            </span>
                        </PromptSuggestion>
                    </div>

                    <PromptInput
                        isLoading={isLoading}
                        value={prompt}
                        onValueChange={setPrompt}
                        onSubmit={handleSubmit}
                        className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
                    >
                        <div className="flex flex-col">
                            <PromptInputTextarea
                                placeholder="Ask anything"
                                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                            />

                            <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                                <div className="flex items-center gap-2">
                                    <PromptInputAction tooltip="Add a new action">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full"
                                        >
                                            <Plus size={18} />
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="Search">
                                        <Button variant="outline" className="rounded-full">
                                            <Globe size={18} />
                                            Search
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="More actions">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full"
                                        >
                                            <MoreHorizontal size={18} />
                                        </Button>
                                    </PromptInputAction>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PromptInputAction tooltip="Voice input">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full"
                                        >
                                            <Mic size={18} />
                                        </Button>
                                    </PromptInputAction>

                                    <Button
                                        size="icon"
                                        disabled={!prompt.trim() || isLoading}
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
        </main >
    )
}

