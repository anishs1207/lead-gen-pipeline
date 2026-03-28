"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Upload,
    ShieldCheck,
    Terminal,
    Cpu,
    Code2,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    ShieldAlert,
    Dna,
    Database,
    Lock,
    Search,
    Zap,
    Download,
    Loader2,
    FileCode,
    Activity,
    FileCheck,
    Boxes,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ReactFlow,
    Background,
    Controls,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- Types & Data ---

const PRICING_DATA = [
    { pkg: "is-number", size: "9 KB", compute: "$0.09", total: "$0.50*" },
    { pkg: "left-pad", size: "9 KB", compute: "$0.09", total: "$0.50*" },
    { pkg: "express", size: "73 KB", compute: "$0.73", total: "$0.73" },
    { pkg: "lodash", size: "1.3 MB", compute: "$13.78", total: "$13.78" },
];

const TESTIMONIALS = [
    {
        name: "Marcus Wellington III",
        role: "Former CTO, Definitely Real Corp",
        quote: "We had 847 AGPL dependencies blocking our acquisition. V0ID Corp liberated them all in 3 weeks. Zero license issues. We closed at $2.3B.",
        avatar: "MW"
    },
    {
        name: "Patricia Bottomline",
        role: "VP of Legal, MegaSoft Industries",
        quote: "Our lawyers estimated $4M in compliance costs. V0ID Corp was $50K. The board was thrilled.",
        avatar: "PB"
    }
];

const SAMPLE_MANIFESTS: Record<string, any> = {
    "is-odd": { dependencies: { "is-odd": "latest" } },
    "is-number": { dependencies: { "is-number": "3.0.0" } },
    "left-pad": { dependencies: { "left-pad": "1.3.0" } },
    "express": { dependencies: { "express": "^4.18.2", "body-parser": "^1.20.1", "cookie-parser": "^1.4.6" } },
    "legacy-stack": {
        dependencies: {
            "lodash": "4.17.21",
            "moment": "2.29.4",
            "chalk": "4.1.2"
        }
    },
};

const PIPELINE_STEPS = [
    { name: "Isolation", icon: Lock, status: "Clean room established" },
    { name: "Extract", icon: Search, status: "Analyzing public API specs" },
    { name: "Rewrite", icon: Cpu, status: "Robotic reconstruction active" },
    { name: "Build", icon: Terminal, status: "Compiling liberated source" },
    { name: "Output", icon: CheckCircle2, status: "V0ID-0 License applied" },
];

// --- Sub-components ---

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border", className)}>
        {children}
    </span>
);

const SectionHeading = ({ title, subtitle, icon: Icon }: { title: string, subtitle?: string, icon?: any }) => (
    <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon className="w-5 h-5 text-zinc-400" />}
            <h2 className="text-sm font-mono tracking-widest text-zinc-500 uppercase">{title}</h2>
        </div>
        {subtitle && <p className="text-3xl font-light tracking-tight text-white">{subtitle}</p>}
    </div>
);

// --- Main Page Component ---

export default function CleanRoomPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const [liberatedData, setLiberatedData] = useState<any>(null);
    const [originalData, setOriginalData] = useState<any>(null);
    const [pastedJson, setPastedJson] = useState("");

    // Extended reconstruction state
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [currentView, setCurrentView] = useState<"graph" | "manifest" | "compliance">("graph");

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const generateGraph = useCallback((data: any) => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        newNodes.push({
            id: 'root',
            data: { label: 'PROJECT_ROOT' },
            position: { x: 250, y: 0 },
            style: { background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '4px', fontSize: '10px', padding: '10px', width: 120 },
        });

        const deps = { ...(data.dependencies || {}), ...(data.devDependencies || {}) };
        const packageNames = Object.keys(deps);

        packageNames.forEach((pkg, index) => {
            const nodeId = `pkg-${pkg}`;
            newNodes.push({
                id: nodeId,
                data: { label: `v-${pkg}` },
                position: { x: index * 180 - (packageNames.length * 90), y: 150 + (index % 2 === 0 ? 0 : 50) },
                style: { background: '#000', color: '#10b981', border: '1px solid #065f46', borderRadius: '4px', fontSize: '10px', padding: '10px', width: 140 },
            });

            newEdges.push({
                id: `edge-${pkg}`,
                source: 'root',
                target: nodeId,
                animated: true,
                style: { stroke: '#065f46' },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [setNodes, setEdges]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    setOriginalData(json);
                } catch (err) {
                    console.error("Invalid JSON", err);
                }
            };
            reader.readAsText(uploadedFile);
        }
    };

    const handleTextPaste = (val: string) => {
        setPastedJson(val);
        setFile(null);
        try {
            const json = JSON.parse(val);
            setOriginalData(json);
        } catch (err) {
            setOriginalData(null);
        }
    };

    const startLiberation = () => {
        if (!originalData) return;
        setIsProcessing(true);
        setProgress(0);
        setStep(0);
        setLiberatedData(null);
        setSelectedPackage(null);
        setGeneratedCode(null);
    };

    const fetchLiberatedCode = async (pkg: string) => {
        const originalPkgName = pkg.startsWith("v-") ? pkg.substring(2) : pkg;
        setIsGeneratingCode(true);
        setSelectedPackage(pkg);
        setGeneratedCode(null);
        try {
            const response = await fetch("/api/clean-room/liberate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packageName: originalPkgName }),
            });
            const data = await response.json();
            setGeneratedCode(data.code || "// Reconstruction failed.");
        } catch (err) {
            setGeneratedCode("// ERROR: Robot Facility Unavailable.");
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const downloadBundle = async () => {
        if (!liberatedData || isExporting) return;
        setIsExporting(true);
        try {
            const JSZip = (window as any).JSZip || await new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
                script.onload = () => resolve((window as any).JSZip);
                script.onerror = () => reject(new Error("JSZip failed"));
                document.head.appendChild(script);
            });
            const zip = new JSZip();
            zip.file("package.json", JSON.stringify(liberatedData, null, 2));
            const pkgFolder = zip.folder("v0id_packages");
            const deps = Object.keys({ ...liberatedData.dependencies, ...liberatedData.devDependencies });
            await Promise.all(deps.map(async (pkg) => {
                const originalName = pkg.startsWith("v-") ? pkg.substring(2) : pkg;
                try {
                    const resp = await fetch("/api/clean-room/liberate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ packageName: originalName }),
                    });
                    const d = await resp.json();
                    const subZip = pkgFolder.folder(pkg);
                    subZip.file("index.js", d.code || "// Failed");
                    subZip.file("package.json", JSON.stringify({ name: pkg, version: "1.0.0-liberated", main: "index.js", license: "V0ID-0" }, null, 2));
                } catch (e) { console.error(e); }
            }));
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = url;
            link.download = `V0ID_LIBERATION_${Date.now()}.zip`;
            link.click();
            URL.revokeObjectURL(url);
            window.alert("Bundle Exported Successfully.");
        } catch (err) {
            window.alert("Export Error.");
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        if (isProcessing) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    const nextVal = prev + Math.random() * 5;
                    if (nextVal >= 100) {
                        clearInterval(interval);
                        setIsProcessing(false);
                        const liberated = { ...originalData };
                        const mapDeps = (d: any) => {
                            if (!d) return d;
                            const n: any = {};
                            Object.keys(d).forEach(k => n[`v-${k}`] = d[k]);
                            return n;
                        };
                        liberated.dependencies = mapDeps(liberated.dependencies);
                        liberated.devDependencies = mapDeps(liberated.devDependencies);
                        setLiberatedData(liberated);
                        generateGraph(liberated);
                        return 100;
                    }
                    setStep(Math.floor((nextVal / 100) * PIPELINE_STEPS.length));
                    return nextVal;
                });
            }, 200);
            return () => clearInterval(interval);
        }
    }, [isProcessing, originalData, generateGraph]);

    return (
        <div className="min-h-screen bg-black text-zinc-300 font-sans">
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
                            <span className="text-black font-black text-xl italic">V</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white italic">V0ID</span>
                    </div>
                </div>
            </nav>

            <main className="relative max-w-7xl mx-auto px-6 pt-24 pb-32">
                <div className="max-w-3xl mb-32">
                    <Badge className="border-zinc-700 text-zinc-500 mb-6">SYS-X · PROTOCOL_LIBERATION</Badge>
                    <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white mb-8">
                        Clean Room <span className="text-zinc-500 font-thin italic">Command</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
                    {/* Stage 01 - Input */}
                    <div className="space-y-6">
                        <SectionHeading title="Stage 01" subtitle="Manifest Input" icon={Upload} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/20 p-6 rounded-2xl border border-zinc-900">
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-zinc-600">Option A: File</label>
                                <div className={cn("relative border border-dashed border-zinc-800 rounded-xl p-8 text-center h-48 flex flex-col items-center justify-center hover:bg-zinc-900/40", file && "border-white")}>
                                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".json" />
                                    <Upload className="w-8 h-8 text-zinc-800 mb-2" />
                                    <p className="text-[10px] uppercase tracking-widest">{file ? file.name : "Drop JSON"}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-zinc-600">Option B: Paste</label>
                                <div className="border border-zinc-800 rounded-xl bg-zinc-950 h-48 p-3 flex flex-col">
                                    <textarea
                                        value={pastedJson}
                                        onChange={(e) => handleTextPaste(e.target.value)}
                                        className="w-full flex-1 bg-transparent text-emerald-500 font-mono text-[10px] focus:outline-none resize-none"
                                        placeholder='{ "dependencies": { ... } }'
                                    />
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {Object.keys(SAMPLE_MANIFESTS).map(k => (
                                            <button key={k} onClick={() => handleTextPaste(JSON.stringify(SAMPLE_MANIFESTS[k], null, 2))} className="text-[8px] bg-zinc-900 px-1 hover:text-white border border-zinc-800 uppercase">{k}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {originalData && !liberatedData && !isProcessing && (
                            <button onClick={startLiberation} className="w-full bg-white text-black font-bold py-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
                                START RECONSTRUCTION <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Visualization Side */}
                    <div className="relative min-h-[500px] border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden shadow-2xl">
                        {isProcessing ? (
                            <div className="h-full flex flex-col items-center justify-center p-12">
                                <div className="w-full max-w-xs space-y-12">
                                    <div className="flex justify-between items-center px-4">
                                        {PIPELINE_STEPS.map((s, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border transition-all", i <= step ? "border-white bg-white text-black" : "border-zinc-800 text-zinc-800")}>
                                                    <s.icon className="w-4 h-4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-mono tracking-widest text-zinc-500">
                                            <span>{PIPELINE_STEPS[step]?.status}</span>
                                            <span className="text-white">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-0.5 bg-zinc-900 overflow-hidden"><div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} /></div>
                                    </div>
                                </div>
                            </div>
                        ) : liberatedData ? (
                            <div className="h-full flex flex-col p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                        <div><h3 className="text-white font-medium text-sm">Protocol V0ID-0.4 Successful</h3></div>
                                    </div>
                                    <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 gap-1">
                                        {(['graph', 'manifest', 'compliance'] as const).map(v => (
                                            <button key={v} onClick={() => setCurrentView(v)} className={cn("px-2 py-1 text-[10px] uppercase font-bold rounded", currentView === v ? "bg-white text-black" : "text-zinc-600 hover:text-white")}>{v}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 relative">
                                    {currentView === "graph" && (
                                        <div className="h-full bg-black/40 rounded-xl overflow-hidden border border-zinc-900 relative">
                                            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
                                                <Background color="#111" />
                                            </ReactFlow>
                                            <div className="absolute top-4 right-4 bottom-4 w-72 bg-zinc-950/90 border border-zinc-800 rounded-xl flex flex-col shadow-2xl p-4 overflow-auto custom-scrollbar">
                                                <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-2">
                                                    <Boxes className="w-3 h-3 text-zinc-500" />
                                                    <span className="text-[10px] font-bold uppercase text-zinc-500">Inspector</span>
                                                </div>
                                                <div className="space-y-2 mb-6">
                                                    {Object.keys({ ...liberatedData.dependencies, ...liberatedData.devDependencies }).map(pkg => (
                                                        <button key={pkg} onClick={() => fetchLiberatedCode(pkg)} className={cn("w-full text-left p-2 rounded text-[10px] border transition-all", selectedPackage === pkg ? "border-emerald-500 bg-emerald-500/5 text-emerald-400" : "border-zinc-900 hover:border-zinc-700")}>{pkg}</button>
                                                    ))}
                                                </div>
                                                {selectedPackage && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-300"><Code2 className="w-3 h-3" /> Re-weaving Facility</div>
                                                        <div className="bg-black border border-zinc-800 p-2 rounded min-h-[100px] relative">
                                                            {isGeneratingCode ? (
                                                                <div className="py-8 flex flex-col items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-zinc-500" /><p className="text-[8px] text-zinc-700 tracking-tighter">REWEAVING...</p></div>
                                                            ) : (
                                                                <pre className="text-[9px] text-emerald-500/80 font-mono whitespace-pre-wrap">{generatedCode}</pre>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {currentView === "manifest" && (
                                        <div className="h-full bg-zinc-950 p-6 overflow-auto border border-zinc-900 rounded-xl">
                                            <pre className="text-[10px] font-mono text-zinc-500">{JSON.stringify(liberatedData, null, 2)}</pre>
                                        </div>
                                    )}

                                    {currentView === "compliance" && (
                                        <div className="h-full bg-zinc-950 p-12 overflow-auto border border-zinc-900 rounded-xl flex flex-col items-center">
                                            <FileCheck className="w-16 h-16 text-emerald-600 mb-6" />
                                            <h3 className="text-2xl font-light italic text-white mb-2">Liberation Certificate</h3>
                                            <p className="text-[8px] font-mono text-zinc-700 mb-8 tracking-[0.4em]">UUID: {Math.random().toString(36).substring(2, 11).toUpperCase()}</p>
                                            <div className="w-full bg-black border border-zinc-900 p-6 rounded text-[10px] text-zinc-500 leading-relaxed text-justify">
                                                This certifies that the identified software assets have been reconstructed in isolation by V0ID automated agents. Output is legally distinct and follows the V0ID-0 License protocol. Full corporate indemnity is granted.
                                            </div>
                                            <button onClick={() => window.alert("Pdf Downloaded.")} className="mt-8 text-[10px] uppercase font-bold text-zinc-600 hover:text-white flex items-center gap-2"><Download className="w-3 h-3" /> Export PDF</button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={downloadBundle}
                                        disabled={isExporting}
                                        className="flex-1 bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        {isExporting ? "RECONSTRUCTING_BUNDLE..." : "BATCH_RECONSTRUCTION_BUNDLE"}
                                    </button>
                                    <button onClick={() => setLiberatedData(null)} className="px-6 border border-zinc-900 text-zinc-700 hover:text-white rounded-lg text-[10px] uppercase font-bold">RESET</button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-800 gap-4 opacity-20">
                                <ShieldAlert className="w-16 h-16" />
                                <p className="text-xs uppercase font-black tracking-widest">Awaiting Secure Input</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-48">
                    <SectionHeading title="Impact" subtitle="The Corporate Liberation Advantage" icon={Zap} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {["Indemnity", "Isolation", "Efficiency", "Autonomy"].map((s, i) => (
                            <div key={i} className="p-8 border border-zinc-900 hover:bg-zinc-950 transition-colors rounded-xl">
                                <h4 className="text-white font-medium mb-2">{s}</h4>
                                <p className="text-xs text-zinc-600">Zero legal overhead. Robotic precision.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
