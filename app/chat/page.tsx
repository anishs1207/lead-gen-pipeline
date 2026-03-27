"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useState } from "react";
import { SidebarRight, ChatContent, Sheets, ChatSidebar } from "@/components/chat";

function createEmptyTable(rows = 1, columns = 7) {
    const table = [];

    for (let r = 0; r < rows; r++) {
        const row = [];

        for (let c = 0; c < columns; c++) {
            row.push({ value: "" });
        }

        table.push(row);
    }

    return table;
}

export default function ChatApp() {
    const [data, setData] = useState<Array<Array<{ value: string | number }>>>(createEmptyTable(20, 10));

    return (
        <SidebarProvider>
            <ChatSidebar />
            <SidebarInset className="flex flex-col min-w-0 overflow-hidden h-screen">
                <div className="flex flex-row m-0">
                    <ChatContent />
                    <Sheets data={data} setData={setData} />
                </div>
            </SidebarInset>
            <SidebarRight data={data} setData={setData} />
        </SidebarProvider >
    )
}