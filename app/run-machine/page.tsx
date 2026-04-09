"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Terminal, Zap, ShieldAlert, Cpu, Database,
    Loader2, Maximize2, X, Minus, Globe,
    Lock, Command, ChevronRight, Activity,
    Box, HardDrive, Network
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Design Tokens ---
const TERMINAL_GREEN = "text-[#10b981]";
const TERMINAL_GREEN_GLOW = "shadow-[0_0_15px_rgba(16,185,129,0.3)]";
const CRITICAL_RED = "text-red-500";
const DIM_ZINC = "text-zinc-600";

// --- Types ---
interface TerminalLine {
    type: "input" | "output" | "error" | "system" | "dir";
    content: string;
    timestamp: string;
    dir?: string;
}

export default function RunMachinePage() {
    const [history, setHistory] = useState<TerminalLine[]>([
        { type: "system", content: "V0ID BRIDGE PROTOCOL v4.12.08 [INITIALIZED]", timestamp: new Date().toLocaleTimeString() },
        { type: "system", content: "CONNECTION_TYPE: DIRECT_HOST_SHELL", timestamp: new Date().toLocaleTimeString() },
        { type: "dir", content: "Root access established.", timestamp: new Date().toLocaleTimeString() },
    ]);
    const [input, setInput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [currentCwd, setCurrentCwd] = useState<string>("");
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial CWD fetch
    useEffect(() => {
        const fetchInitialCwd = async () => {
            try {
                const response = await fetch("/api/run-machine/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ command: "cd" }), // Just to get the dir
                });
                const data = await response.json();
                if (data.cwd) setCurrentCwd(data.cwd);
            } catch (err) {
                console.error("Initial CWD fetch failed", err);
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchInitialCwd();
    }, []);

    const executeCommand = async (cmd: string) => {
        if (!cmd.trim()) return;

        const timestamp = new Date().toLocaleTimeString();

        // Handle clear locally
        if (cmd.trim() === "clear") {
            setHistory([{ type: "system", content: "Buffer cleared.", timestamp }]);
            setInput("");
            return;
        }

        const newLine: TerminalLine = {
            type: "input",
            content: cmd,
            timestamp,
            dir: currentCwd
        };
        setHistory(prev => [...prev, newLine]);
        setInput("");
        setIsExecuting(true);

        try {
            const response = await fetch("/api/run-machine/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: cmd, cwd: currentCwd }),
            });

            const data = await response.json();

            if (data.stdout) {
                setHistory(prev => [...prev, {
                    type: "output",
                    content: data.stdout,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            }
            if (data.stderr) {
                setHistory(prev => [...prev, {
                    type: "error",
                    content: data.stderr,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            }
            if (data.cwd) {
                setCurrentCwd(data.cwd);
            }
        } catch (err) {
            setHistory(prev => [...prev, {
                type: "error",
                content: "BRIDGE_RECON_FAILURE: Local process was terminated unexpectedly.",
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsExecuting(false);
            // Refocus after execution
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isExecuting) {
            executeCommand(input);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isExecuting]);

    const handleWindowClick = () => {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
            inputRef.current?.focus();
        }
    };

    const shortCwd = currentCwd.split(/[\\/]/).pop() || "~";

    return (
        <div className="min-h-screen bg-[#020202] text-zinc-300 selection:bg-[#10b981]/30 selection:text-white overflow-hidden flex flex-col font-mono">
            {/* CRT Effects */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,128,0.06))] bg-[length:100%_2px,3px_100%]" />
            <div className="fixed inset-0 pointer-events-none z-[101] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            <div className="fixed inset-x-0 h-[2px] bg-[#10b981]/5 top-0 animate-[scan_8s_linear_infinite] z-[102] pointer-events-none shadow-[0_0_15px_#10b981]" />

            {/* Sidebar / Topbar Stats */}
            <div className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-[#050505] shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-6 h-6 bg-[#10b981] flex items-center justify-center rounded-sm rotate-45 transition-transform group-hover:rotate-0">
                            <span className="text-black font-black text-sm -rotate-45 group-hover:rotate-0 italic transition-transform">V</span>
                        </div>
                        <span className="text-lg font-bold tracking-tighter text-white">V0ID_BRIDGE</span>
                    </div>

                    <div className="h-4 w-px bg-zinc-800" />

                    <div className="flex items-center gap-4 text-[10px] tracking-widest text-zinc-500">
                        <div className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-[#10b981]" /> <span>SYS_LOAD: 4%</span></div>
                        <div className="flex items-center gap-1.5"><Network className="w-3 h-3 text-blue-500" /> <span>HOST: MACHINE-ANISH</span></div>
                        <div className="flex items-center gap-1.5"><Database className="w-3 h-3 text-amber-500" /> <span>FS: READY</span></div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Protocol</span>
                        <span className="text-[10px] text-[#10b981] italic">DIRECT_HOST_INJECTION</span>
                    </div>
                    <div className="w-8 h-8 rounded border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 cursor-pointer text-zinc-500">
                        <ShieldAlert className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Main Terminal Area - Massive Size */}
            <main className="flex-1 flex flex-col p-4 md:p-8 bg-black">
                <div
                    onClick={handleWindowClick}
                    className="flex-1 bg-[#010101] border border-zinc-900 rounded-lg flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative"
                >
                    {/* Inner Terminal Header */}
                    <div className="px-4 h-8 bg-zinc-900/50 flex justify-between items-center border-b border-zinc-900">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                        </div>
                        <div className="text-[9px] text-zinc-600 tracking-widest uppercase flex items-center gap-2">
                            <Lock className="w-3 h-3" /> Terminal_Session_Active
                        </div>
                        <div className="w-10" />
                    </div>

                    {/* Scrollable Content */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden p-6 text-[12px] leading-relaxed relative custom-scrollbar"
                    >
                        <div className="max-w-5xl mx-auto space-y-4">
                            {history.map((line, i) => (
                                <div key={i} className={cn(
                                    "flex flex-col gap-1",
                                    line.type === "input" && "mb-2",
                                    line.type === "error" && "text-red-400 bg-red-400/5 p-3 rounded border border-red-500/20",
                                    line.type === "system" && "text-zinc-600 opacity-80",
                                    line.type === "dir" && "text-amber-500 p-2 border-l-2 border-amber-500/20 bg-amber-500/5"
                                )}>
                                    {line.type === "input" && (
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <span className="text-zinc-700">[{line.timestamp}]</span>
                                            <span className="text-[#10b981] font-bold italic font-sans flex items-center gap-1">
                                                <Box className="w-3 h-3" /> {line.dir?.split(/[\\/]/).pop() || "~"}
                                            </span>
                                            <ChevronRight className="w-3 h-3 text-zinc-800" />
                                            <span className="text-white font-mono">{line.content}</span>
                                        </div>
                                    )}
                                    {line.type === "output" && (
                                        <pre className="text-[#10b981]/90 whitespace-pre-wrap pl-6 animate-[fadeIn_0.2s_ease-out]">
                                            {line.content}
                                        </pre>
                                    )}
                                    {line.type !== "input" && line.type !== "output" && (
                                        <div className="flex gap-2 items-center">
                                            <span className="text-[9px] opacity-30 mt-0.5">{line.timestamp}</span>
                                            <div className="break-all">{line.content}</div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isExecuting && (
                                <div className="flex items-center gap-3 text-[#10b981] animate-pulse py-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-[10px] tracking-[0.3em] font-black italic">PROCESSING_HOST_PAYLOAD...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Prompt - Glued to bottom */}
                    <div className="p-4 bg-[#050505] border-t border-zinc-900 group">
                        <div className="max-w-5xl mx-auto flex items-center gap-3">
                            <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#10b981]/5 border border-[#10b981]/20">
                                <HardDrive className="w-3 h-3 text-[#10b981]" />
                                <span className="text-[10px] font-bold text-[#10b981] tracking-tight">{isInitialLoading ? "..." : shortCwd}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-800" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                readOnly={isExecuting || isInitialLoading}
                                autoFocus
                                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[13px] placeholder:text-zinc-800 focus:placeholder:text-zinc-700 transition-colors"
                                placeholder={isInitialLoading ? "connecting..." : "v0id@host: inject command_"}
                            />
                            {!isExecuting && (
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                    <span className="text-[8px] font-bold text-zinc-700 tracking-widest uppercase">SYSCALL_READY</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 flex justify-between items-center px-2">
                    <div className="flex gap-4 text-[9px] text-zinc-600 uppercase tracking-widest font-black">
                        <span>CPU_INTEL_VPRO</span>
                        <span>RAM_DDR5_ECC</span>
                        <span>KERNEL_NT_10.0</span>
                    </div>
                    <div className="text-[9px] text-zinc-800">
                        (C) 2026 V0ID CORP · ALL RIGHTS RESERVED
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @keyframes scan {
                    from { transform: translateY(-100vh); }
                    to { transform: translateY(100vh); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1a1a1a;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #10b981;
                }
            `}</style>
        </div>
    );
}