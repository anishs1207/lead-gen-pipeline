import CanvasChatBoard from "@/components/canvas/CanvasChat";

export default async function Page() {
    return (
        <CanvasChatBoard />
    )
}

// completely overhauled to meet the complex requirements.

// New Features:
// Multi-Model Support (/multi command):
// Typing /multi [query] in any chat node will create a new response block that displays 3 parallel columns from different "models" (Gemini, GPT-4o, Claude, etc.) side-by-side.
// The node automatically expands to a wider width to accommodate the columns.
// Voting Panel Mode (/vote command):
// Typing /vote [query] triggers a panel mode where 5 models generate responses, and a "Winner" is automatically highlighted based on a simulated vote count.
// Context-Aware Branching:
// Select any text inside a message. A tooltip "Branch Selection" will appear near your cursor.
// Clicking it creates a new branch that is contextually linked to that specific snippet of text.
// Node Merging:
// If a node has a parent, a "Merge" button (Combine icon) appears in the header.
// Clicking it merges the current node's conversation history back into the parent node and deletes the child node, effectively "committing" the branch.
// Minimap:
// A fully functional minimap in the bottom right corner shows the layout of all nodes.
// You can click on the minimap to instantly jump the camera to that location.
// It shows a red Viewport rectangle indicating your current camera position.
// Resizable Nodes:
// Every node now has a drag handle at the bottom border.
// You can drag to resize the height of any individual chat node.
// Visual Improvements:
// Updated types to support complex message structures (variants, Multi-Model columns).
// Added visual indicators for different chat types (Standard, Multi-Model, Panel).
// You can test these features by typing /multi hello or /vote explain quantum physics in the initial chat node.

// File Updated:
// web/components/new/CanvasChat.tsx

// Good
// Bad
// Review Changes




// Conversation mode
// Planning
// Agent can plan before executing tasks. Use for deep research, complex tasks, or collaborative work
// Fast
// Agent will execute tasks directly. Use for simple tasks that can be completed faster

