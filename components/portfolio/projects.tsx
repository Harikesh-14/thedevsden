"use client";

import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  GitBranch,
  Layers3,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const projects = [
  {
    title: "StoryLang",
    description:
      "A lightweight programming language designed for writing interactive stories, with its own lexer, parser, AST and HTML generator.",
    tags: ["C++", "Compiler", "Parser", "AST"],
    type: "Language / Compiler",
    github: "https://github.com/harikeshranjan/storylang",
    featured: true,
  },
  {
    title: "Blooplingo",
    description:
      "A personal Russian and Turkish language platform, where we can practice vocabulary, alphabets and common phrases. More to come",
    tags: ["NextJS", "Supabase", "PostgreSQL"],
    type: "Website",
    github: "https://github.com/harikeshranjan/blooplingo",
    featured: false,
  },
  {
    title: "Sutra",
    description:
      "A developer-focused and AI integrated CLI tool for automating the basic github commands",
    tags: ["Node.js", "TypeScript", "CLI", "AI", "Ollama"],
    type: "Developer Tool",
    github: "https://github.com/harikeshranjan/Sutra",
    featured: false,
  },
  {
    title: "Rit",
    description:
      "A simple logger which is especially made for the Node.js system. Based on the configuration, you can get the log messages in the console or in a particular files",
    tags: ["Node.js", "Logger", "TypeScript", "NPM"],
    type: "Developer Tools",
    github: "https://github.com/harikeshranjan/rit-js",
    featured: false,
  },
];

const githubAccounts = [
  {
    name: "Primary GitHub",
    username: "@Harikesh-14",
    description: "My main profile, projects and open-source work.",
    href: "https://github.com/Harikesh-14",
  },
  {
    name: "Secondary GitHub",
    username: "@harikeshranjan",
    description: "Experiments, learning projects and side quests.",
    href: "https://github.com/harikeshranjan",
  },
];

export default function ProjectsSection() {
  return (
    <section
      id="projects"
      className="border-b bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">

        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end lg:mb-16">
          <div className="max-w-3xl">
            <div className="mb-5 h-0.75 w-8 rounded-full bg-emerald-500" />

            <Badge
              variant="secondary"
              className="mb-5 gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
            >
              <Sparkles className="size-3" />
              Selected work
            </Badge>

            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl lg:text-5xl">
              Things I've{" "}
              <span className="text-neutral-400 dark:text-neutral-500">
                built.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-500 dark:text-neutral-400 sm:text-lg">
              A collection of projects I've built while exploring software
              engineering, artificial intelligence, developer tools and
              computer science.
            </p>
          </div>

          {/* View all */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-fit shrink-0 rounded-full border-neutral-200 text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
              >
                View all projects
                <ArrowUpRight className="ml-1.5 size-4" />
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Find me on GitHub
                </DialogTitle>

                <DialogDescription className="leading-6 text-neutral-500 dark:text-neutral-400">
                  I keep different kinds of projects across two GitHub
                  accounts. Pick a profile to explore everything I've built.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                {githubAccounts.map((account) => (
                  <a
                    key={account.name}
                    href={account.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-neutral-200 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                      <GitBranch className="size-5 text-neutral-700 dark:text-neutral-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {account.name}
                      </p>

                      <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                        {account.username}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                        {account.description}
                      </p>
                    </div>

                    <ExternalLink className="size-4 shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500" />
                  </a>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">

          {projects.map((project) => (
            <article
              key={project.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)] dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-emerald-900 dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)]"
            >

              {/* Project visual/header */}
              <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">

                {/* Decorative grid */}
                <div
                  className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Large background number */}
                <span className="absolute right-5 top-2 select-none text-8xl font-bold tracking-tighter text-neutral-200/70 dark:text-neutral-800/50">
                  {String(projects.indexOf(project) + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900 dark:bg-neutral-900">
                  {project.type === "Artificial Intelligence" ? (
                    <Sparkles className="size-7 text-emerald-500" />
                  ) : project.type === "Developer Tool" ? (
                    <Code2 className="size-7 text-emerald-500" />
                  ) : project.type === "Language / Compiler" ? (
                    <Layers3 className="size-7 text-emerald-500" />
                  ) : (
                    <Code2 className="size-7 text-emerald-500" />
                  )}
                </div>

                {/* Type */}
                <span className="absolute bottom-4 left-5 rounded-full border border-neutral-200 bg-white/90 px-2.5 py-1 text-[10px] font-medium text-neutral-500 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-400">
                  {project.type}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">

                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {project.title}
                  </h3>

                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${project.title} on GitHub`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-neutral-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                  >
                    <GitBranch className="size-4" />
                  </a>
                </div>

                <p className="mt-3 flex-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom link */}
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link mt-6 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  View project
                  <ArrowUpRight className="size-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Always building. Usually experimenting.
          </p>

          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            More projects live on GitHub.
          </p>
        </div>
      </div>
    </section>
  );
}