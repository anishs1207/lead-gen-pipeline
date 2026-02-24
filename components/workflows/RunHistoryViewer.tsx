"use client"

import { useState } from "react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import {
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import CopyButton from "./CopyButton";
import { History, Clock, X } from "lucide-react";

type NodeStatus = "idle" | "running" | "success" | "error";

interface RunHistoryEntry {
    id: string;
    workflowName: string;
    ranAt: string;
    duration: number;
    nodeResults: Record<string, { label: string; status: NodeStatus; result: string; error: string }>;
}

export default function RunHistoryViewer({
    runs,
    onClose,
    onDelete,
}: {
    runs: RunHistoryEntry[];
    onClose: () => void;
    onDelete: (id: string) => void;
}) {
    const [selectedRun, setSelectedRun] = useState<RunHistoryEntry | null>(null);

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" /> Run History
                    </h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Run list */}
                    <div className="w-64 border-r overflow-y-auto p-2 shrink-0">
                        {runs.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-8 italic">No runs yet</p>
                        ) : (
                            runs.map((run) => (
                                <div
                                    key={run.id}
                                    className={cn(
                                        "group flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-colors mb-1",
                                        selectedRun?.id === run.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40"
                                    )}
                                    onClick={() => setSelectedRun(run)}
                                >
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{run.workflowName}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {new Date(run.ranAt).toLocaleString()} · {(run.duration / 1000).toFixed(1)}s
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon"
                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                                        onClick={(e) => { e.stopPropagation(); onDelete(run.id); if (selectedRun?.id === run.id) setSelectedRun(null); }}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Run detail */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {!selectedRun ? (
                            <p className="text-xs text-muted-foreground text-center py-8 italic">Select a run to view details</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">{selectedRun.workflowName}</h4>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(selectedRun.ranAt).toLocaleString()} · {(selectedRun.duration / 1000).toFixed(1)}s
                                    </span>
                                </div>
                                {Object.entries(selectedRun.nodeResults).map(([nodeId, nr]) => (
                                    <div key={nodeId} className={cn(
                                        "rounded-lg border p-3",
                                        nr.status === "success" ? "border-emerald-500/20" : "border-red-500/20"
                                    )}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold flex items-center gap-1.5">
                                                {nr.status === "success"
                                                    ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                    : <AlertCircle className="w-3 h-3 text-red-400" />}
                                                {nr.label}
                                            </span>
                                            {nr.status === "success" && <CopyButton text={nr.result} />}
                                        </div>
                                        {nr.status === "success" ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs max-h-[200px] overflow-y-auto">
                                                <Markdown>{nr.result}</Markdown>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-red-400">{nr.error}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}