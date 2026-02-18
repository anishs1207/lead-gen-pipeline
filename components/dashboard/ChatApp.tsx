"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ChatSidebar from "./ChatSidebar";
import ChatContent from "./ChatContent";
import { SidebarRight } from "./SidebarRight";
import Sheets from "./Sheets";
import { useState } from "react";

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
    const [data, setData] = useState(createEmptyTable(20, 10));

    return (
        <SidebarProvider>
            <ChatSidebar />
            <SidebarInset className="flex flex-col min-w-0 overflow-hidden h-screen">
                <div className="flex flex-row m-0">
                    <ChatContent data={data} setData={setData} />
                    <Sheets data={data} setData={setData} />
                </div>
            </SidebarInset>
            <SidebarRight />
        </SidebarProvider >
    )
}
