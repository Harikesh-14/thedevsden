"use client"

import { useState } from "react"
import {
  ArrowUpRight,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { accentByDominant, categoryMeta, ProjectPlan, SkillCategory } from "@/lib/project-planner"

// ── Mock data (replace with API data later) ────────────────────────────────
const mockProjects: ProjectPlan[] = [
  {
    id: "1",
    title: "Blooplingo",
    content:
      "A language-learning platform for Russian and Turkish vocabulary with spaced repetition and gamified progress tracking.",
    skills: {
      frontend: ["Next.js", "React", "Tailwind CSS"],
      backend: ["Node.js", "NestJS", "REST APIs"],
      database: ["MongoDB", "Mongoose"],
    },
    updatedAt: "2 days ago",
  },
  {
    id: "2",
    title: "DevCLI Toolkit",
    content:
      "A command-line toolkit for automating common developer workflows, scaffolding projects and managing local environments.",
    skills: {
      backend: ["TypeScript", "Node.js"],
      cli: ["Commander.js", "Inquirer"],
    },
    updatedAt: "5 days ago",
  },
  {
    id: "3",
    title: "SentimentAI",
    content:
      "An NLP pipeline for real-time sentiment analysis using transformer models with a FastAPI REST layer and dashboard.",
    skills: {
      aiMl: ["Python", "NLP", "LLMs", "Model Training"],
      backend: ["FastAPI"],
    },
    updatedAt: "1 week ago",
  },
  {
    id: "4",
    title: "QuickDeploy",
    content:
      "A lightweight DevOps tool for spinning up containerised apps with one command and managing deployment pipelines.",
    skills: {
      devOps: ["Docker", "GitHub Actions"],
      backend: ["Node.js"],
      cli: ["Bash"],
    },
    updatedAt: "2 weeks ago",
  },
]

const stats = [
  { label: "Total plans", value: String(mockProjects.length), accent: false },
  { label: "Active", value: "4", accent: true },
  { label: "Tech stacks", value: "12", accent: false },
  { label: "Completed", value: "2", accent: false },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function getDominantCategory(skills: ProjectPlan["skills"]): SkillCategory {
  const order: SkillCategory[] = [
    "aiMl", "frontend", "backend", "mobile", "desktop", "cli", "devOps", "testing", "database", "other",
  ]
  return order.find((k) => (skills[k]?.length ?? 0) > 0) ?? "other"
}

function getAllSkillChips(skills: ProjectPlan["skills"]) {
  const chips: { label: string; category: SkillCategory }[] = []
  for (const [cat, vals] of Object.entries(skills) as [SkillCategory, string[]][]) {
    for (const v of vals ?? []) chips.push({ label: v, category: cat })
  }
  return chips
}

// ── Sub-components ─────────────────────────────────────────────────────────
function ProjectCard({ project, onOpen }: { project: ProjectPlan; onOpen: () => void }) {
  const dominant = getDominantCategory(project.skills)
  const accent = accentByDominant[dominant]
  const allChips = getAllSkillChips(project.skills)
  const visible = allChips.slice(0, 5)
  const overflow = allChips.length - visible.length

  return (
    <article
      onClick={onOpen}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] cursor-pointer",
        "border border-white/[0.07] bg-white/3",
        "backdrop-blur-xl",
        "transition-all duration-200",
        "hover:border-white/[0.14] hover:bg-white/5 hover:-translate-y-1",
        "hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
      )}
    >
      {/* Accent bar */}
      <div className={cn("h-0.75 w-full bg-linear-to-r to-transparent", accent)} />

      <div className="flex flex-1 flex-col p-5">
        {/* Top row */}
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-semibold leading-snug tracking-[-0.01em] text-white/88">
            {project.title}
          </h3>
          <button
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg",
              "border border-white/[0.07] bg-white/4",
              "text-white/25 transition-colors",
              "hover:bg-white/8 hover:text-white/60",
              "opacity-0 group-hover:opacity-100",
            )}
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-[12px] leading-[1.65] text-white/28">
          {project.content}
        </p>

        {/* Skill chips */}
        <div className="mb-4">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/20">
            Tech stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {visible.map(({ label, category }) => (
              <span
                key={label}
                className={cn(
                  "rounded-[6px] border px-2 py-0.5 text-[10px] font-medium",
                  categoryMeta[category].chip,
                )}
              >
                {label}
              </span>
            ))}
            {overflow > 0 && (
              <span className="rounded-[6px] border border-white/6 bg-white/4 px-2 py-0.5 text-[10px] font-medium text-white/25">
                +{overflow}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-[10px] text-white/20">
            Updated {project.updatedAt}
          </span>
          <div
            className={cn(
              "flex size-6.5 items-center justify-center rounded-[8px]",
              "border border-emerald-500/15 bg-emerald-500/6",
              "text-emerald-400/50 transition-all duration-150",
              "group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-400/80",
            )}
          >
            <ArrowUpRight className="size-3" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </article>
  )
}

function NewPlanCard({ onClick }: { onClick: () => void }) {
  const router = useRouter();

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex min-h-50 flex-col items-center justify-center gap-3 rounded-[20px]",
        "border border-dashed border-white/9",
        "bg-white/1.5 backdrop-blur-xl",
        "text-center transition-all duration-200",
        "hover:border-emerald-500/25 hover:bg-emerald-500/3",
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          "border border-emerald-500/20 bg-emerald-500/[0.07]",
          "text-emerald-400/60 transition-all duration-200",
          "group-hover:border-emerald-500/35 group-hover:bg-emerald-500/12 group-hover:text-emerald-400/90",
        )}
        onClick={() => router.push("/developer-dashboard/project-planner/new-plan")}
      >
        <Plus className="size-4" strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-white/30 group-hover:text-white/50 transition-colors">
          New plan
        </p>
        <p className="mt-0.5 text-[11px] text-white/15 group-hover:text-white/25 transition-colors">
          Start planning your next project
        </p>
      </div>
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProjectPlannerPage() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")

  const router = useRouter()

  const filtered = mockProjects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.content.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed -top-16 left-1/4  h-56 w-80 rounded-full bg-emerald-500/9 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed -bottom-16 right-1/4 h-52 w-72 rounded-full bg-emerald-500/6 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Project Planner
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
              Your projects.
              <span className="ml-2 text-white/25">Your vision.</span>
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/35">
              Plan, organise and track every project from idea to execution.
            </p>
          </div>

          <button
            className={cn(
              "group flex h-10 items-center gap-2 rounded-xl px-4",
              "border border-emerald-500/20 bg-emerald-500/8",
              "text-[12.5px] font-semibold text-emerald-400/80",
              "transition-all duration-150",
              "hover:border-emerald-500/35 hover:bg-emerald-500/13 hover:text-emerald-400",
              "active:scale-[0.98]",
            )}
            onClick={() => router.push("/developer-dashboard/project-planner/new-plan")}
          >
            <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
            New plan
          </button>
        </header>

        {/* ── Stats ── */}
        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, accent }) => (
            <div
              key={label}
              className="rounded-[18px] border border-white/[0.07] bg-white/3 p-4 backdrop-blur-xl"
            >
              <p className="text-[11px] font-medium text-white/30">{label}</p>
              <p className={cn(
                "mt-1 text-[26px] font-semibold tracking-[-0.03em]",
                accent ? "text-emerald-400" : "text-white/88",
              )}>
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* ── Toolbar ── */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-45">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project plans…"
              className={cn(
                "h-9 w-full rounded-xl pl-9 pr-4",
                "border border-white/[0.07] bg-white/4",
                "text-[12.5px] text-white/70 placeholder:text-white/20",
                "outline-none backdrop-blur-xl",
                "focus:border-emerald-500/30 focus:bg-emerald-500/4",
                "transition-colors duration-150",
              )}
            />
          </div>

          {/* Filter */}
          <button className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-3.5",
            "border border-white/[0.07] bg-white/3",
            "text-[12px] font-medium text-white/35",
            "hover:bg-white/6 hover:text-white/55 transition-all",
          )}>
            <SlidersHorizontal className="size-3.5" />
            Filter
          </button>

          {/* Sort */}
          <button className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-3.5",
            "border border-white/[0.07] bg-white/3",
            "text-[12px] font-medium text-white/35",
            "hover:bg-white/6 hover:text-white/55 transition-all",
          )}>
            <ArrowUpDown className="size-3.5" />
            Sort
          </button>

          {/* View toggle */}
          <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/3 p-1">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-all duration-150",
                  view === v
                    ? "bg-white/8 text-white/70"
                    : "text-white/25 hover:text-white/45",
                )}
              >
                {v === "grid"
                  ? <LayoutGrid className="size-3.5" />
                  : <List className="size-3.5" />
                }
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid / List ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-24">
            <p className="text-sm font-medium text-white/20">No plans match your search</p>
            <p className="text-xs text-white/12">Try a different keyword</p>
          </div>
        ) : (
          <div className={cn(
            view === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3",
          )}>
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => {
                  // navigate to detail page
                }}
              />
            ))}
            <NewPlanCard onClick={() => {/* open sheet/modal */ }} />
          </div>
        )}

      </div>
    </main>
  )
}