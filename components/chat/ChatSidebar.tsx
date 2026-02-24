"use client"

import { TeamSwitcher } from "./TeamSwitcher";
import {
    AudioWaveform,
    Command,
    PlusIcon,
    Search,
} from "lucide-react"
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenuItem,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
    SidebarFooter
} from "@/components/ui/sidebar"
import NavUser from "./NavUser";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"

// writer her code to connect the chat with the sheets here

// Initial conversation history
const conversationHistory = [
    {
        period: "Today",
        conversations: [
            {
                id: "t1",
                title: "Project roadmap discussion",
                lastMessage:
                    "Let's prioritize the authentication features for the next sprint.",
                timestamp: new Date().setHours(new Date().getHours() - 2),
            },
            {
                id: "t2",
                title: "API Documentation Review",
                lastMessage:
                    "The endpoint descriptions need more detail about rate limiting.",
                timestamp: new Date().setHours(new Date().getHours() - 5),
            },
            {
                id: "t3",
                title: "Frontend Bug Analysis",
                lastMessage:
                    "I found the issue - we need to handle the null state in the user profile component.",
                timestamp: new Date().setHours(new Date().getHours() - 8),
            },
        ],
    },
    {
        period: "Yesterday",
        conversations: [
            {
                id: "y1",
                title: "Database Schema Design",
                lastMessage:
                    "Let's add indexes to improve query performance on these tables.",
                timestamp: new Date().setDate(new Date().getDate() - 1),
            },
            {
                id: "y2",
                title: "Performance Optimization",
                lastMessage:
                    "The lazy loading implementation reduced initial load time by 40%.",
                timestamp: new Date().setDate(new Date().getDate() - 1),
            },
        ],
    },
    {
        period: "Last 7 days",
        conversations: [
            {
                id: "w1",
                title: "Authentication Flow",
                lastMessage: "We should implement the OAuth2 flow with refresh tokens.",
                timestamp: new Date().setDate(new Date().getDate() - 3),
            },
            {
                id: "w2",
                title: "Component Library",
                lastMessage:
                    "These new UI components follow the design system guidelines perfectly.",
                timestamp: new Date().setDate(new Date().getDate() - 5),
            },
            {
                id: "w3",
                title: "UI/UX Feedback",
                lastMessage:
                    "The navigation redesign received positive feedback from the test group.",
                timestamp: new Date().setDate(new Date().getDate() - 6),
            },
        ],
    },
    {
        period: "Last month",
        conversations: [
            {
                id: "m1",
                title: "Initial Project Setup",
                lastMessage:
                    "All the development environments are now configured consistently.",
                timestamp: new Date().setDate(new Date().getDate() - 15),
            },
            {
                id: "m1",
                title: "Initial Project Setup",
                lastMessage:
                    "All the development environments are now configured consistently.",
                timestamp: new Date().setDate(new Date().getDate() - 15),
            },
            {
                id: "m1",
                title: "Initial Project Setup",
                lastMessage:
                    "All the development environments are now configured consistently.",
                timestamp: new Date().setDate(new Date().getDate() - 15),
            },
            {
                id: "m1",
                title: "Initial Project Setup",
                lastMessage:
                    "All the development environments are now configured consistently.",
                timestamp: new Date().setDate(new Date().getDate() - 15),
            },
            {
                id: "m1",
                title: "Initial Project Setup",
                lastMessage:
                    "All the development environments are now configured consistently.",
                timestamp: new Date().setDate(new Date().getDate() - 15),
            },
            {
                id: "m1",
                title: "Initial Project Setup",
                lastMessage:
                    "All the development environments are now configured consistently.",
                timestamp: new Date().setDate(new Date().getDate() - 15),
            },

        ],
    },
]

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}

const dataNew = {
    teams: [
        {
            name: "Acme Inc",
            logo: Command,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
}

//2
export default function ChatSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="flex flex-col items-start justify-between gap-2 px-2 py-4">
                <TeamSwitcher teams={dataNew.teams} />
            </SidebarHeader>
            <SidebarContent className="">
                <div className="px-3 space-y-2">
                    <Button
                        variant="ghost"
                        className="
      w-full
      cursor-pointer
      justify-start gap-3
      rounded-lg
      text-sm font-normal
      hover:bg-muted
      transition-colors
    "
                    >
                        <PlusIcon className="h-4 w-4 text-muted-foreground" />
                        <span>New Chat</span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="
      w-full
      justify-start gap-3
      rounded-lg
      cursor-pointer
      text-sm font-normal
      hover:bg-muted
      transition-colors
    "
                    >
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span>Search</span>
                    </Button>
                </div>

                {conversationHistory.map((group) => (
                    <SidebarGroup key={group.period}>
                        <SidebarGroupLabel>{group.period}</SidebarGroupLabel>

                        <SidebarMenu>
                            {group.conversations.map((conversation) => (
                                <SidebarMenuItem key={conversation.id}>
                                    <SidebarMenuButton className="group flex items-center justify-between">
                                        {/* Conversation title */}
                                        <span className="truncate">{conversation.title}</span>

                                        {/* 3-dot menu */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="
                    opacity-0 group-hover:opacity-100
                    focus:opacity-100
                    transition-opacity
                    ml-2
                    p-1
                    rounded-md
                    hover:bg-muted
                  "
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" side="right">
                                                <DropdownMenuItem
                                                    // @ts-expect-error
                                                    onClick={() => handleRename(conversation.id)}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Rename
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    //@ts-expect-error
                                                    onClick={() => handleDelete(conversation.id)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar >
    )
}


