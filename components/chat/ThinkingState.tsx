import { useState, useEffect } from "react";

export default function ThinkingState() {
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
