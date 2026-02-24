"use client";


import { Plus } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { LoaderBasic } from "./Loader";
import * as React from "react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    useSidebar,
} from "@/components/ui/sidebar";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="start"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

import {
    ChatContainerContent,
    ChatContainerRoot,
} from "@/components/ui/chat-container"
import {
    Message,
    MessageAction,
    MessageActions,
    MessageContent,
} from "@/components/ui/message"
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { ScrollButton } from "@/components/ui/scroll-button"
import { Button } from "@/components/ui/button"
import {
    SidebarInput,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
    ArrowUp,
    Copy,
    Globe,
    Mic,
    MoreHorizontal,
    Pencil,
    ThumbsDown,
    ThumbsUp,
    Trash,
} from "lucide-react";

import { useState, useRef } from "react";

type ChatMessage = {
    id: number
    role: "user" | "assistant"
    content: string
}

// add the loader here

import {
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtItem,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
} from "@/components/ui/chain-of-thought"


// export function SidebarRight(
//     props: React.ComponentProps<typeof Sidebar>
// ) {
//     const [prompt, setPrompt] = useState("")
//     const [isLoading, setIsLoading] = useState(false)
//     const [chatMessages, setChatMessages] = useState<
//         (ChatMessage & { isTyping?: boolean })[]
//     >([])
//     const chatContainerRef = useRef<HTMLDivElement>(null)

//     const handleSubmit = () => {
//         if (!prompt.trim() || isLoading) return

//         const userText = prompt.trim()

//         const userMessage = {
//             id: Date.now(),
//             role: "user",
//             content: userText,
//         }

//         const typingMessage = {
//             id: Date.now() + 1,
//             role: "assistant",
//             content: "",
//             isTyping: true,
//         }

//         setChatMessages(prev => [...prev, userMessage, typingMessage])
//         setPrompt("")
//         setIsLoading(true)

//         // ⏳ Simulate thinking delay
//         setTimeout(() => {
//             setChatMessages(prev =>
//                 prev.map(msg =>
//                     msg.isTyping
//                         ? {
//                             id: Date.now() + 2,
//                             role: "assistant",
//                             content: `Hello World you said: ${userText}`,
//                         }
//                         : msg
//                 )
//             )
//             setIsLoading(false)
//         }, 2500) // 2.5 seconds
//     }

//     return (
//         <>
//             <Sidebar
//                 collapsible="none"
//                 className="sticky top-0 hidden h-svh border-l lg:flex w-[350px]"
//                 {...props}
//             >
//                 <SidebarHeader className="h-16 border-b px-4 flex items-center justify-between">
//                     <NavUser user={data.user} />
//                 </SidebarHeader>

//                 <SidebarContent className="flex flex-col overflow-hidden">
//                     <div
//                         ref={chatContainerRef}
//                         className="relative flex-1 overflow-y-auto"
//                     >
//                         <ChatContainerRoot className="h-full">
//                             <ChatContainerContent className="px-4 py-6 space-y-4">
//                                 {chatMessages.map((message) => {
//                                     const isAssistant = message.role === "assistant"

//                                     return (
//                                         <Message
//                                             key={message.id}
//                                             className={cn(
//                                                 "flex w-full",
//                                                 isAssistant ? "justify-start" : "justify-end"
//                                             )}
//                                         >
//                                             <div className="group flex flex-col gap-1">
//                                                 {/* <MessageContent
//                                                     className={cn(
//                                                         "rounded-2xl px-4 py-2 text-sm",
//                                                         isAssistant
//                                                             ? "bg-transparent text-foreground"
//                                                             : "bg-muted text-primary"
//                                                     )}
//                                                 >





//                                                     {message.isTyping ? (
//                                                         <div className="flex items-center gap-2 text-muted-foreground">
//                                                             <LoaderBasic />
//                                                             {/* <span className="text-sm">Thinking…</span> */}
//                                                 {/* </div>
//                                                     ) : (
//                                                         message.content
//                                                     )}

//  */}





//                                                 {/* </MessageContent> */}

//                                                 <MessageContent
//                                                     className={cn(
//                                                         "rounded-2xl px-4 py-2 text-sm",
//                                                         isAssistant
//                                                             ? "bg-transparent text-foreground"
//                                                             : "bg-muted text-primary"
//                                                     )}
//                                                 >
//                                                     {message.isTyping ? (
//                                                         <>
//                                                             <ChainOfThoughtStreaming />
//                                                         </>
//                                                     ) : (
//                                                         message.content
//                                                     )}
//                                                 </MessageContent>


//                                                 {isAssistant && !message.isTyping && (
//                                                     // <MessageActions className="opacity-0 group-hover:opacity-100 transition-opacity">
//                                                     //     <MessageAction tooltip="Copy">
//                                                     //         <Button
//                                                     //             size="icon"
//                                                     //             variant="ghost"
//                                                     //             className="rounded-full"
//                                                     //         >
//                                                     //             <Copy />
//                                                     //         </Button>
//                                                     //     </MessageAction>
//                                                     // </MessageActions>
//                                                     <ChainOfThoughtStreaming />
//                                                 )}

//                                             </div>
//                                         </Message>
//                                     )
//                                 })}
//                             </ChatContainerContent>

//                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
//                                 <ScrollButton />
//                             </div>
//                         </ChatContainerRoot>
//                     </div>

//                     <div className="p-3 border-t">
//                         <PromptInput
//                             value={prompt}
//                             isLoading={isLoading}
//                             onValueChange={setPrompt}
//                             onSubmit={handleSubmit}
//                             className="rounded-3xl border bg-popover"
//                         >
//                             <>
//                                 {/* fix this it should be trandpabnt */}
//                                 <PromptInputTextarea
//                                     placeholder="Type a message…"
//                                     disabled={isLoading}
//                                     // className="px-4 pt-3"
//                                     className="
//     bg-transparent
//     focus:bg-transparent
//     text-foreground
//     placeholder:text-muted-foreground
//   "
//                                 />

//                                 {/* <PromptInputActions className="flex justify-end px-3 pb-3 mt-2">
//                                     <Button
//                                         size="icon"
//                                         disabled={!prompt.trim() || isLoading}
//                                         onClick={handleSubmit}
//                                         className="rounded-full"
//                                     >
//                                         {!isLoading ? (
//                                             <ArrowUp size={18} />
//                                         ) : (
//                                             <span className="size-3 rounded-xs bg-white" />
//                                         )}
//                                     </Button>
//                                 </PromptInputActions> */}
//                                 <PromptInputActions className="flex justify-end px-3 pb-3 mt-2">
//                                     {/* <Button
//                                         size="icon"
//                                         disabled={!prompt.trim()}
//                                         onClick={handleSubmit}
//                                         className="rounded-full"
//                                     >
//                                         <ArrowUp />
//                                     </Button>
//                                     <Button
//                                         size="icon"
//                                         disabled={!prompt.trim()}
//                                         onClick={handleSubmit}
//                                         className="rounded-full"
//                                     >
//                                         <ArrowUp />
//                                     </Button> */}
//                                     <div className="flex items-center gap-3">
//                                         <PromptInputAction tooltip="Add a new action">
//                                             <Button
//                                                 variant="outline"
//                                                 size="icon"
//                                                 className="size-9 rounded-full"
//                                             >
//                                                 <Plus size={18} />
//                                             </Button>
//                                         </PromptInputAction>

//                                         <PromptInputAction tooltip="Search">
//                                             <Button variant="outline" className="rounded-full">
//                                                 <Globe size={18} />
//                                                 Search
//                                             </Button>
//                                         </PromptInputAction>

//                                         <PromptInputAction tooltip="More actions">
//                                             <Button
//                                                 variant="outline"
//                                                 size="icon"
//                                                 className="size-9 rounded-full"
//                                             >
//                                                 <MoreHorizontal size={18} />
//                                             </Button>
//                                         </PromptInputAction>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <PromptInputAction tooltip="Voice input">
//                                             <Button
//                                                 variant="outline"
//                                                 size="icon"
//                                                 className="size-9 rounded-full"
//                                             >
//                                                 <Mic size={18} />
//                                             </Button>
//                                         </PromptInputAction>

//                                         <Button
//                                             size="icon"
//                                             disabled={!prompt.trim() || isLoading}
//                                             onClick={handleSubmit}
//                                             className="size-9 rounded-full"
//                                         >
//                                             {!isLoading ? (
//                                                 <ArrowUp size={18} />
//                                             ) : (
//                                                 <span className="size-3 rounded-xs bg-white" />
//                                             )}
//                                         </Button>
//                                     </div>
//                                 </PromptInputActions>

//                             </>
//                         </PromptInput>
//                     </div>
//                 </SidebarContent>

//                 {/* <SidebarFooter>
//                     <SidebarMenu>
//                         <SidebarMenuItem>
//                             <SidebarMenuButton>
//                                 <Plus />
//                                 <span>New Chat</span>
//                             </SidebarMenuButton>
//                         </SidebarMenuItem>
//                     </SidebarMenu>
//                 </SidebarFooter> */}
//             </Sidebar >
//         </>
//     )
// }


// import { useEffect } from "react"

// type CoTStep = {
//     trigger: string
//     items: string[]
// }

// export function useChainOfThoughtStream(
//     steps: CoTStep[],
//     speed = 600
// ) {
//     const [visibleSteps, setVisibleSteps] = useState<CoTStep[]>([])
//     const [done, setDone] = useState(false)

//     useEffect(() => {
//         let stepIndex = 0
//         let itemIndex = 0

//         const interval = setInterval(() => {
//             setVisibleSteps(prev => {
//                 const next = [...prev]

//                 if (!next[stepIndex]) {
//                     next[stepIndex] = {
//                         trigger: steps[stepIndex].trigger,
//                         items: [],
//                     }
//                 }

//                 next[stepIndex].items.push(
//                     steps[stepIndex].items[itemIndex]
//                 )

//                 itemIndex++

//                 if (itemIndex >= steps[stepIndex].items.length) {
//                     stepIndex++
//                     itemIndex = 0
//                 }

//                 if (stepIndex >= steps.length) {
//                     clearInterval(interval)
//                     setDone(true)
//                 }

//                 return next
//             })
//         }, speed)

//         return () => clearInterval(interval)
//     }, [steps, speed])

//     return { visibleSteps, done }
// }

// export function ChainOfThoughtStreaming() {
//     const steps = [
//         {
//             trigger: "Analyzing the user's request",
//             items: [
//                 "The user asked about implementing a sorting algorithm",
//                 "This is a technical programming question",
//             ],
//         },
//         {
//             trigger: "Considering implementation options",
//             items: [
//                 "Quick sort: fast on average",
//                 "Merge sort: stable and predictable",
//                 "Bubble sort: simple but inefficient",
//             ],
//         },
//         {
//             trigger: "Selecting the best approach",
//             items: [
//                 "Merge sort is best for explanation",
//                 "Clearly demonstrates divide-and-conquer",
//             ],
//         },
//     ]

//     const { visibleSteps, done } = useChainOfThoughtStream(steps)

//     return (
//         <div className="w-full max-w-3xl space-y-3 text-sm text-muted-foreground">
//             <ChainOfThought>
//                 {visibleSteps.map((step, i) => (
//                     <ChainOfThoughtStep key={i}>
//                         <ChainOfThoughtTrigger>
//                             {step.trigger}
//                         </ChainOfThoughtTrigger>

//                         <ChainOfThoughtContent>
//                             {step.items.map((item, j) => (
//                                 <ChainOfThoughtItem key={j}>
//                                     {item}
//                                 </ChainOfThoughtItem>
//                             ))}
//                         </ChainOfThoughtContent>
//                     </ChainOfThoughtStep>
//                 ))}
//             </ChainOfThought>

//             {!done && (
//                 <div className="flex items-center gap-2">
//                     <LoaderBasic />
//                     <span>Thinking…</span>
//                 </div>
//             )}
//         </div>
//     )
// }

import { useEffect } from "react"

export default function SidebarRight(
    props: React.ComponentProps<typeof Sidebar>
) {
    const [prompt, setPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [chatMessages, setChatMessages] = useState<
        (ChatMessage & { isTyping?: boolean })[]
    >([])
    const chatContainerRef = useRef<HTMLDivElement>(null)

    const handleSubmit = () => {
        if (!prompt.trim() || isLoading) return

        const userText = prompt.trim()

        const userMessage: ChatMessage = {
            id: Date.now(),
            role: "user",
            content: userText,
        }

        const typingMessage: ChatMessage & { isTyping: boolean } = {
            id: Date.now() + 1,
            role: "assistant",
            content: "",
            isTyping: true,
        }

        setChatMessages(prev => [...prev, userMessage, typingMessage])
        setPrompt("")
        setIsLoading(true)

        setTimeout(() => {
            setChatMessages(prev =>
                prev.map(msg =>
                    msg.isTyping
                        ? {
                            id: Date.now() + 2,
                            role: "assistant",
                            content: `Hello World you said: ${userText}`,
                        }
                        : msg
                )
            )
            setIsLoading(false)
        }, 2500)
    }

    return (
        <Sidebar
            collapsible="none"
            className="sticky top-0 hidden h-svh w-[350px] border-l lg:flex"
            {...props}
        >
            <SidebarHeader className="h-16 border-b px-4 flex items-center">
                <NavUser user={data.user} />
            </SidebarHeader>

            <SidebarContent className="flex flex-col overflow-hidden">
                {/* CHAT */}
                <div
                    ref={chatContainerRef}
                    className="relative flex-1 overflow-y-auto"
                >
                    <ChatContainerRoot className="h-full">
                        <ChatContainerContent className="px-4 py-6 space-y-4">
                            {chatMessages.map(message => {
                                const isAssistant = message.role === "assistant"

                                return (
                                    <Message
                                        key={message.id}
                                        className={cn(
                                            "flex w-full",
                                            isAssistant ? "justify-start" : "justify-end"
                                        )}
                                    >
                                        <div className="flex flex-col gap-1 max-w-[85%]">
                                            {/* @ts-expect-error */}
                                            <MessageContent
                                                className={cn(
                                                    "rounded-2xl px-4 py-2 text-sm",
                                                    isAssistant
                                                        ? "bg-transparent text-foreground"
                                                        : "bg-muted text-primary"
                                                )}
                                            >
                                                {message.isTyping ? (
                                                    <ChainOfThoughtStreaming />
                                                ) : (
                                                    message.content
                                                )}
                                            </MessageContent>
                                        </div>
                                    </Message>
                                )
                            })}
                        </ChatContainerContent>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                            <ScrollButton />
                        </div>
                    </ChatContainerRoot>
                </div>

                {/* INPUT */}
                <div className="border-t p-3">
                    <PromptInput
                        value={prompt}
                        isLoading={isLoading}
                        onValueChange={setPrompt}
                        onSubmit={handleSubmit}
                        className="rounded-3xl border bg-popover shadow-none"
                    >
                        <>
                            <PromptInputTextarea
                                placeholder="Type a message…"
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

                  text-foreground
                  placeholder:text-muted-foreground

                  resize-none
                  px-4
                  pt-3
                "
                            />

                            <PromptInputActions className="flex justify-between items-end px-3 pb-3 mt-2">
                                <div className="flex items-center gap-3">
                                    <PromptInputAction tooltip="Add">
                                        <Button variant="outline" size="icon" className="size-9 rounded-full">
                                            <Plus size={18} />
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="Search">
                                        <Button variant="outline" className="rounded-full">
                                            <Globe size={18} />
                                            Search
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="More">
                                        <Button variant="outline" size="icon" className="size-9 rounded-full">
                                            <MoreHorizontal size={18} />
                                        </Button>
                                    </PromptInputAction>
                                </div>

                                <div className="flex items-center gap-2">
                                    <PromptInputAction tooltip="Voice">
                                        <Button variant="outline" size="icon" className="size-9 rounded-full">
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
                        </>
                    </PromptInput>
                </div>
            </SidebarContent>
        </Sidebar>
    )
}

/* ---------------- Chain of Thought ---------------- */

type CoTStep = {
    trigger: string
    items: string[]
}

export function useChainOfThoughtStream(
    steps: CoTStep[],
    speed = 600
) {
    const [visibleSteps, setVisibleSteps] = useState<CoTStep[]>([])
    const [done, setDone] = useState(false)

    useEffect(() => {
        let stepIndex = 0
        let itemIndex = 0

        const interval = setInterval(() => {
            setVisibleSteps(prev => {
                const next = [...prev]

                if (!next[stepIndex]) {
                    next[stepIndex] = {
                        trigger: steps[stepIndex].trigger,
                        items: [],
                    }
                }

                next[stepIndex].items.push(
                    steps[stepIndex].items[itemIndex]
                )

                itemIndex++

                if (itemIndex >= steps[stepIndex].items.length) {
                    stepIndex++
                    itemIndex = 0
                }

                if (stepIndex >= steps.length) {
                    clearInterval(interval)
                    setDone(true)
                }

                return next
            })
        }, speed)

        return () => clearInterval(interval)
    }, [steps, speed])

    return { visibleSteps, done }
}

export function ChainOfThoughtStreaming() {
    const steps: CoTStep[] = [
        {
            trigger: "Analyzing the user's request",
            items: [
                "The user asked about implementing a sorting algorithm",
                "This is a technical programming question",
            ],
        },
        {
            trigger: "Considering implementation options",
            items: [
                "Quick sort: fast on average",
                "Merge sort: stable and predictable",
                "Bubble sort: simple but inefficient",
            ],
        },
        {
            trigger: "Selecting the best approach",
            items: [
                "Merge sort is best for explanation",
                "Clearly demonstrates divide-and-conquer",
            ],
        },
    ]

    const { visibleSteps, done } = useChainOfThoughtStream(steps)

    return (
        <div className="w-full space-y-3 text-sm text-muted-foreground">
            <ChainOfThought>
                {visibleSteps.map((step, i) => (
                    <ChainOfThoughtStep key={i}>
                        <ChainOfThoughtTrigger>
                            {step.trigger}
                        </ChainOfThoughtTrigger>

                        <ChainOfThoughtContent>
                            {step.items.map((item, j) => (
                                <ChainOfThoughtItem key={j}>
                                    {item}
                                </ChainOfThoughtItem>
                            ))}
                        </ChainOfThoughtContent>
                    </ChainOfThoughtStep>
                ))}
            </ChainOfThought>

            {!done && (
                <div className="flex items-center gap-2">
                    <LoaderBasic />
                    <span>Thinking…</span>
                </div>
            )}
        </div>
    )
}
