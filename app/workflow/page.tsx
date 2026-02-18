"use client";

import { Canvas } from "@/components/ai-elements/canvas";
import { Edge } from "@/components/ai-elements/edge";
import {
    Node,
    NodeContent,
    NodeDescription,
    NodeFooter,
    NodeHeader,
    NodeTitle,
} from "@/components/ai-elements/node";
import { useMemo } from "react";
import { nanoid } from "nanoid";

// Use stable IDs (not regenerated on each render)
const NODE_IDS = {
    decision: "node-decision",
    output1: "node-output1",
    output2: "node-output2",
    process1: "node-process1",
    process2: "node-process2",
    start: "node-start",
};

const initialNodes = [
    {
        data: {
            description: "Initialize workflow",
            handles: { source: true, target: false },
            label: "Start",
        },
        id: NODE_IDS.start,
        position: { x: 0, y: 0 },
        type: "workflow",
    },
    {
        data: {
            description: "Transform input",
            handles: { source: true, target: true },
            label: "Process Data",
        },
        id: NODE_IDS.process1,
        position: { x: 500, y: 0 },
        type: "workflow",
    },
    {
        data: {
            description: "Route based on conditions",
            handles: { source: true, target: true },
            label: "Decision Point",
        },
        id: NODE_IDS.decision,
        position: { x: 1000, y: 0 },
        type: "workflow",
    },
    {
        data: {
            description: "Handle success case",
            handles: { source: true, target: true },
            label: "Success Path",
        },
        id: NODE_IDS.output1,
        position: { x: 1500, y: -100 },
        type: "workflow",
    },
    {
        data: {
            description: "Handle error case",
            handles: { source: true, target: true },
            label: "Error Path",
        },
        id: NODE_IDS.output2,
        position: { x: 1500, y: 100 },
        type: "workflow",
    },
    {
        data: {
            description: "Finalize workflow",
            handles: { source: false, target: true },
            label: "Complete",
        },
        id: NODE_IDS.process2,
        position: { x: 2000, y: 0 },
        type: "workflow",
    },
];

const initialEdges = [
    {
        id: "edge-1",
        source: NODE_IDS.start,
        target: NODE_IDS.process1,
        type: "animated",
    },
    {
        id: "edge-2",
        source: NODE_IDS.process1,
        target: NODE_IDS.decision,
        type: "animated",
    },
    {
        id: "edge-3",
        source: NODE_IDS.decision,
        target: NODE_IDS.output1,
        type: "animated",
    },
    {
        id: "edge-4",
        source: NODE_IDS.decision,
        target: NODE_IDS.output2,
        type: "temporary",
    },
    {
        id: "edge-5",
        source: NODE_IDS.output1,
        target: NODE_IDS.process2,
        type: "animated",
    },
    {
        id: "edge-6",
        source: NODE_IDS.output2,
        target: NODE_IDS.process2,
        type: "temporary",
    },
];

const nodeTypes = {
    workflow: ({
        data,
    }: {
        data: {
            label: string;
            description: string;
            handles: { target: boolean; source: boolean };
        };
    }) => (
        <Node handles={data.handles}>
            <NodeHeader>
                <NodeTitle>{data.label}</NodeTitle>
                <NodeDescription>{data.description}</NodeDescription>
            </NodeHeader>
            <NodeContent>
                <p>test</p>
            </NodeContent>
            <NodeFooter>
                <p>test</p>
            </NodeFooter>
        </Node>
    ),
};

const edgeTypes = {
    animated: Edge.Animated,
    temporary: Edge.Temporary,
};

export default function WorkflowPage() {
    return (
        // ReactFlow REQUIRES a container with explicit height!
        <div className="w-full h-screen">
            <Canvas
                edges={initialEdges}
                edgeTypes={edgeTypes}
                fitView
                nodes={initialNodes}
                nodeTypes={nodeTypes}
            />
        </div>
    );
}