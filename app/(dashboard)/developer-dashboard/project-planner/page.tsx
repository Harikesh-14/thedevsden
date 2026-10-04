"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowUpRight,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  accentByDominant,
  categoryMeta,
  ProjectPlan,
  SkillCategory,
} from "@/lib/project-planner"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"

// ── Helpers ────────────────────────────────────────────────────────────────
function getDominantCategory(skills: ProjectPlan["skills"]): SkillCategory {
  const order: SkillCategory[] = [
    "aiMl",
    "frontend",
    "backend",
    "mobile",
    "desktop",
    "cli",
    "devOps",
    "testing",
    "database",
    "other",
  ]
  return order.find((k) => (skills[k]?.length ?? 0) > 0) ?? "other"
}

function getAllSkillChips(skills: ProjectPlan["skills"]) {
  const chips: { label: string; category: SkillCategory }[] = []
  const seen = new Set<string>()

  for (const [cat, vals] of Object.entries(skills) as [
    SkillCategory,
    string[],
  ][]) {
    for (const value of vals ?? []) {
      if (typeof value !== "string") continue
      const label = value.trim()
      if (!label) continue
      const normalized = label.toLowerCase()
      if (seen.has(normalized)) continue
      seen.add(normalized)
      chips.push({ label, category: cat })
    }
  }

  return chips
}

// ── Action menu ────────────────────────────────────────────────────────────
function ProjectActionMenu({
  isCompleted,
  onToggleComplete,
  onUpdate,
  onDelete,
}: {
  isCompleted: boolean
  onToggleComplete: () => void
  onUpdate: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const actions = [
    {
      label: isCompleted ? "Mark as incomplete" : "Mark as complete",
      icon: isCompleted ? Circle : CheckCircle2,
      onClick: onToggleComplete,
      danger: false,
    },
    { label: "Update", icon: Pencil, onClick: onUpdate, danger: false },
    { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
  ]

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Project actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((c) => !c)
        }}
        className={cn(
          "flex size-8 items-center justify-center rounded-lg transition-all duration-150",
          "opacity-0 group-hover:opacity-100",
          // Light
          "border border-neutral-200 bg-neutral-50 text-neutral-400",
          "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
          // Dark
          "dark:border-white/[0.07] dark:bg-white/4 dark:text-white/40",
          "dark:hover:border-white/[0.14] dark:hover:bg-white/8 dark:hover:text-white/80"
        )}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-full right-0 z-50 mt-2 w-52 rounded-xl p-1.5",
            // Light
            "border border-neutral-200 bg-white shadow-xl shadow-neutral-900/10",
            // Dark
            "dark:border-white/8 dark:bg-[#151719] dark:shadow-2xl dark:shadow-black/50"
          )}
        >
          {actions.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onClick()
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs transition-colors",
                danger
                  ? "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white/65 dark:hover:bg-white/6 dark:hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Project card ───────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onOpen,
  onToggleComplete,
  onUpdate,
  onDelete,
}: {
  project: ProjectPlan
  onOpen: () => void
  onToggleComplete: () => void
  onUpdate: () => void
  onDelete: () => void
}) {
  const dominant = getDominantCategory(project.skills)
  const accent = accentByDominant[dominant]
  const allChips = getAllSkillChips(project.skills)
  const visible = allChips.slice(0, 5)
  const overflow = allChips.length - visible.length

  return (
    <article
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-[20px]",
        "transition-all duration-200",
        // Light
        "border border-neutral-200 bg-white",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]",
        "hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50/20",
        "hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]",
        // Dark
        "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
        "dark:hover:border-white/[0.14] dark:hover:bg-white/5",
        "dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      )}
    >
      {/* Accent bar */}
      <div
        className={cn("h-0.75 w-full bg-linear-to-r to-transparent", accent)}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Top row */}
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-[14px] leading-snug font-semibold tracking-[-0.01em]",
              "text-neutral-900 dark:text-white/88"
            )}
          >
            {project.title}
          </h3>

          <ProjectActionMenu
            isCompleted={project.isActive}
            onToggleComplete={onToggleComplete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>

        {/* Description */}
        <p
          className={cn(
            "mb-4 line-clamp-2 text-[12px] leading-[1.65]",
            "text-neutral-500 dark:text-white/30"
          )}
        >
          {project.shortDescription}
        </p>

        {/* Skill chips */}
        <div className="mb-4">
          <p
            className={cn(
              "mb-2 text-[9px] font-semibold tracking-[0.12em] uppercase",
              "text-neutral-400 dark:text-white/20"
            )}
          >
            Tech stack
          </p>

          <div className="flex flex-wrap gap-1.5">
            {visible.map(({ label, category }) => (
              <span
                key={label}
                className={cn(
                  "rounded-[6px] border px-2 py-0.5 text-[10px] font-medium",
                  categoryMeta[category].chip
                )}
              >
                {label}
              </span>
            ))}

            {overflow > 0 && (
              <span
                className={cn(
                  "rounded-[6px] border px-2 py-0.5 text-[10px] font-medium",
                  "border-neutral-200 bg-neutral-100 text-neutral-400",
                  "dark:border-white/6 dark:bg-white/4 dark:text-white/25"
                )}
              >
                +{overflow}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={cn(
            "mt-auto flex items-center justify-between border-t pt-3",
            "border-neutral-100 dark:border-white/5"
          )}
        >
          <span className="text-[10px] text-neutral-400 dark:text-white/20">
            Updated {project.updatedAt}
          </span>

          <div
            className={cn(
              "flex size-6.5 items-center justify-center rounded-[8px] transition-all duration-150",
              // Light
              "border border-emerald-200 bg-emerald-50 text-emerald-600",
              "group-hover:border-emerald-300 group-hover:bg-emerald-100",
              // Dark
              "dark:border-emerald-500/15 dark:bg-emerald-500/6 dark:text-emerald-400/50",
              "dark:group-hover:border-emerald-500/30 dark:group-hover:bg-emerald-500/10 dark:group-hover:text-emerald-400/80"
            )}
          >
            <ArrowUpRight className="size-3" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </article>
  )
}

// ── New plan card ──────────────────────────────────────────────────────────
function NewPlanCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex min-h-50 flex-col items-center justify-center gap-3 rounded-[20px]",
        "text-center transition-all duration-200",
        // Light: 2px dashed, neutral bg so it reads as an affordance, not a gap
        "border-2 border-dashed border-neutral-200 bg-neutral-50/80",
        "hover:border-emerald-300 hover:bg-emerald-50/60",
        // Dark
        "dark:border dark:border-dashed dark:border-white/9 dark:bg-white/1.5",
        "dark:hover:border-emerald-500/25 dark:hover:bg-emerald-500/3"
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl transition-all duration-200",
          // Light
          "border border-emerald-200 bg-emerald-50 text-emerald-600",
          "group-hover:border-emerald-300 group-hover:bg-emerald-100 group-hover:text-emerald-700",
          // Dark
          "dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400/60",
          "dark:group-hover:border-emerald-500/35 dark:group-hover:bg-emerald-500/12 dark:group-hover:text-emerald-400/90"
        )}
      >
        <Plus className="size-4" strokeWidth={2.5} />
      </div>

      <div>
        <p
          className={cn(
            "text-[13px] font-semibold transition-colors",
            "text-neutral-500 group-hover:text-emerald-700",
            "dark:text-white/30 dark:group-hover:text-white/50"
          )}
        >
          New plan
        </p>
        <p
          className={cn(
            "mt-0.5 text-[11px] transition-colors",
            "text-neutral-400 group-hover:text-emerald-600",
            "dark:text-white/15 dark:group-hover:text-white/25"
          )}
        >
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
  const [projectPlans, setProjectPlans] = useState<ProjectPlan[]>([])
  const router = useRouter()

  const stats = [
    { label: "Total plans", value: String(projectPlans.length), accent: false },
    { label: "Active", value: "4", accent: true },
    { label: "Tech stacks", value: "12", accent: false },
    { label: "Completed", value: "2", accent: false },
  ]

  const filtered = projectPlans.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  )

  // ── API ──────────────────────────────────────────────────────────────────
  async function fetchProjectPlans() {
    const response = await apiFetch("/new-projects-plan/get/all")
    if (!response.ok) {
      toast.error("Oops", {
        description: "Error fetching the project plans",
        closeButton: true,
      })
      throw new Error("Error fetching the project plans")
    }
    const data: ProjectPlan[] = await response.json()
    setProjectPlans(data)
  }

  async function toggleComplete(id: string, currentStatus: boolean) {
    try {
      const response = await apiFetch(`/new-projects-plan/update/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (!response.ok) {
        const error = await response.text()
        toast.error("Oops", {
          description: error || "Error toggling status",
          closeButton: true,
        })
        return
      }
      const updated: ProjectPlan = await response.json()
      setProjectPlans((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      )
      toast.success(
        !updated.isActive
          ? "Project marked as active"
          : "Project marked as completed"
      )
    } catch (error) {
      console.error(error)
      toast.error("Oops", {
        description: "Something went wrong",
        closeButton: true,
      })
    }
  }

  async function deleteProjectPlan(id: string) {
    try {
      const response = await apiFetch(`/new-projects-plan/delete/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        toast.error("Oops", {
          description: "Error deleting the project plan",
          closeButton: true,
        })
        throw new Error("Error deleting the project plan")
      }
      setProjectPlans((prev) => prev.filter((p) => p._id !== id))
      toast.success("Plan deleted")
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchProjectPlans()
  }, [])

  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden",
        // Light: a barely-there tint so cards lift off the page
        "bg-white dark:bg-transparent"
      )}
    >
      {/* Ambient glows — stronger in light mode so they're actually visible */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/9"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed right-1/4 -bottom-16 h-52 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/6"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
                  "dark:bg-emerald-400 dark:shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                )}
              />
              <span className="text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase dark:text-white/35">
                Project Planner
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white/90">
              Your projects.
              <span className="ml-2 text-neutral-300 dark:text-white/25">
                Your vision.
              </span>
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-white/35">
              Plan, organise and track every project from idea to execution.
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/developer-dashboard/project-planner/new-plan")
            }
            className={cn(
              "group flex h-10 items-center gap-2 rounded-xl px-4",
              "text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.98]",
              // Light
              "border border-emerald-200 bg-emerald-50 text-emerald-700",
              "hover:border-emerald-300 hover:bg-emerald-100",
              // Dark
              "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-400/80",
              "dark:hover:border-emerald-500/35 dark:hover:bg-emerald-500/13 dark:hover:text-emerald-400"
            )}
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
              className={cn(
                "rounded-[18px] border p-4 backdrop-blur-xl",
                // Light: white card on the neutral-50 page — clear hierarchy
                "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
                // Dark
                "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none"
              )}
            >
              <p className="text-[11px] font-medium text-neutral-400 dark:text-white/30">
                {label}
              </p>
              <p
                className={cn(
                  "mt-1 text-[26px] font-semibold tracking-[-0.03em]",
                  accent
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-800 dark:text-white/88"
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* ── Toolbar ── */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-45 flex-1">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-400 dark:text-white/20" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project plans…"
              className={cn(
                "h-9 w-full rounded-xl pr-4 pl-9 transition-all duration-150 outline-none",
                // Light
                "border border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
                "text-[12.5px] text-neutral-700 placeholder:text-neutral-400",
                "focus:border-emerald-300 focus:bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500/10",
                // Dark
                "dark:border-white/[0.07] dark:bg-white/4 dark:shadow-none",
                "dark:text-white/70 dark:placeholder:text-white/20",
                "dark:focus:border-emerald-500/30 dark:focus:bg-emerald-500/4 dark:focus:ring-0"
              )}
            />
          </div>

          {/* Filter */}
          <button
            className={cn(
              "flex h-9 items-center gap-2 rounded-xl px-3.5 transition-all duration-150",
              "text-[12px] font-medium",
              // Light
              "border border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
              "text-neutral-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
              // Dark
              "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
              "dark:text-white/35 dark:hover:bg-white/6 dark:hover:text-white/55"
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            Filter
          </button>

          {/* Sort */}
          <button
            className={cn(
              "flex h-9 items-center gap-2 rounded-xl px-3.5 transition-all duration-150",
              "text-[12px] font-medium",
              // Light
              "border border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
              "text-neutral-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
              // Dark
              "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
              "dark:text-white/35 dark:hover:bg-white/6 dark:hover:text-white/55"
            )}
          >
            <ArrowUpDown className="size-3.5" />
            Sort
          </button>

          {/* View toggle */}
          <div
            className={cn(
              "flex gap-1 rounded-xl border p-1",
              // Light
              "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
              // Dark
              "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none"
            )}
          >
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-all duration-150",
                  view === v
                    ? "bg-emerald-50 text-emerald-600 dark:bg-white/8 dark:text-white/70"
                    : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-white/25 dark:hover:text-white/45"
                )}
              >
                {v === "grid" ? (
                  <LayoutGrid className="size-3.5" />
                ) : (
                  <List className="size-3.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid / List ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-24">
            <p className="text-sm font-medium text-neutral-400 dark:text-white/20">
              No plans match your search
            </p>
            <p className="text-xs text-neutral-300 dark:text-white/12">
              Try a different keyword
            </p>
          </div>
        ) : (
          <div
            className={cn(
              view === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-3"
            )}
          >
            {filtered.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onOpen={() =>
                  router.push(
                    `/developer-dashboard/project-planner/plan/${project._id}`
                  )
                }
                onToggleComplete={() =>
                  toggleComplete(project._id, project.isActive)
                }
                onUpdate={() => {}}
                onDelete={() => deleteProjectPlan(project._id)}
              />
            ))}
            <NewPlanCard
              onClick={() =>
                router.push("/developer-dashboard/project-planner/new-plan")
              }
            />
          </div>
        )}
      </div>
    </main>
  )
}
