import { WorkflowBuilder } from "@/components/workflows";
import {
    ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function WorkflowPage() {
    return (
        <ReactFlowProvider>
            <WorkflowBuilder />
        </ReactFlowProvider>
    );
}