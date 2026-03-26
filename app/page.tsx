"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import ModeToggle from "@/components/chat/ModeToggle"

// Import project images from the root images directory
import projectOne from "@/images/image.png"
import projectTwo from "@/images/image-1.png"
import projectThree from "@/images/image-2.png"
import projectFour from "@/images/image-3.png";

const projects = [
  {
    id: "canvas",
    title: "Canvas Chat Interface",
    description: "A spatial, 2D node-based chat interface that allows users to branch conversation threads infinitely. It supports running side-by-side comparisons of multiple LLMs simultaneously and processing panel votes to find the best outputs.",
    image: projectThree,
  },
  {
    id: "workflow",
    title: "Workflow Builder",
    description: "A canvas-based drag-and-drop tool built with @xyflow/react to visually build, connect, and configure complex agentic AI workflows. It enables clear representation of node-based LLM decision trees.",
    image: projectOne,

  },
  {
    id: "chat",
    title: "Lead Generation Pipeline",
    description: "A dedicated, embedded spreadsheet interface coupled with an LLM chat sidebar. Ideal for structured data processing, where users can chat to generate and enrich data directly into the attached spreadsheet.",
    image: projectTwo,

  },
  {
    id: "explainer-videos",
    title: "Explainer Video Maker",
    description: "Brainrot Explainer Video Generator - It contains background gaming clips (gta5, minecraft, subway surfers, etc.), background music and scripts generated from the given user topic.",
    image: projectFour,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 relative">
      <div className="absolute top-8 right-8 z-50">
        <ModeToggle />
      </div>
      <div className="container mx-auto pt-20 px-6 max-w-7xl">
        <header className="mb-16 text-center space-y-6">
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            LLM Interfaces
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Fine-tuned software experiences for the next era of intelligence.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <Card
              key={project.title}
              className="group flex flex-col h-full overflow-hidden transition-all duration-300 border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Image Container with Adaptive Theme Integration */}
              <div className="relative h-[300px] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/30 p-4">
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-1 ring-zinc-200/50 dark:ring-white/5 ring-inset bg-zinc-100 dark:bg-zinc-950">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    priority={index < 2}
                    className="object-contain p-4 transition-all duration-700 opacity-95 group-hover:opacity-100 group-hover:scale-[1.02] dark:brightness-[0.95] dark:contrast-[1.05]"
                  />
                </div>
              </div>

              <CardHeader className="flex-1 space-y-4 px-8">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-lg leading-relaxed font-medium text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardFooter className="pt-2 pb-10 px-8">
                <Button asChild className="w-full h-14 text-lg font-bold transition-all shadow-lg hover:shadow-primary/20 group/btn rounded-xl">
                  <Link href={`/${project.id}`} className="flex items-center justify-center gap-2">
                    Try it
                    <ExternalLink className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 mt-20 bg-zinc-50/30 dark:bg-zinc-950/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 max-w-7xl flex justify-center items-center">
          <p className="text-zinc-500 text-center dark:text-zinc-400 font-medium tracking-tight">
            &copy; 2026 LLM Interfaces. Built for the next era of AI.
          </p>
        </div>
      </footer>
    </div>
  )
}