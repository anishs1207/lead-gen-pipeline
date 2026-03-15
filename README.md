# Advanced Multimodal LLM Workspaces

This project provides a comprehensive suite of powerful LLM interfaces built specifically for different use cases. It acts as a unified platform showcasing three distinct AI-driven interactive environments:

## 1. Canvas Chat Interface
A spatial, 2D node-based chat interface that allows users to branch conversation threads infinitely. It supports running side-by-side comparisons of multiple LLMs simultaneously and processing panel votes to find the best outputs.

![Canvas Chat Interface](images/image-2.png)

## 2. Interactive Workflow Builder
A canvas-based drag-and-drop tool built with `@xyflow/react` to visually build, connect, and configure complex agentic AI workflows. It enables clear representation of node-based LLM decision trees.

![Interactive Workflow Builder](images/image.png)

## 3. Lead Generation on Sheets
A dedicated, embedded spreadsheet interface coupled with an LLM chat sidebar. Ideal for structured data processing, where users can chat to generate and enrich data directly into the attached spreadsheet.
![Lead Generation on Sheets](images/image-1.png)


---

## Technical Stack
- **Framework:** Next.js & React
- **AI Integration:** AI SDK (Vercel) & Google Generative AI
- **UI Components:** Radix UI & Tailwind CSS
- **Interactive Graphs:** `@xyflow/react`
- **Spreadsheets:** `react-spreadsheet`
- **Scraping / Context:** Firecrawl JS & MCP SDK

## Getting Started

First, install the dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing
Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started with contributing to this project.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.