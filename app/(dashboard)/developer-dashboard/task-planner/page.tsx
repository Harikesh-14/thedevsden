"use client"

import { useEffect, useRef, useState } from "react"
import {
  MoreHorizontal,
  Plus,
  CheckIcon,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tasks = [
  {
    id: 1,
    task: "Design the new dashboard",
    description: "Create the initial layout and component structure.",
    priority: "high" as const,
    isCompleted: false,
  },
  {
    id: 2,
    task: "Set up authentication",
    description: "Configure JWT authentication and protected routes.",
    priority: "high" as const,
    isCompleted: true,
  },
  {
    id: 3,
    task: "Create task API",
    description: "Implement CRUD endpoints for the task planner.",
    priority: "medium" as const,
    isCompleted: false,
  },
  {
    id: 4,
    task: "Write project documentation",
    description: "Document the API and development setup.",
    priority: "low" as const,
    isCompleted: false,
  },
  {
    id: 5,
    task: "Design database schemas",
    description: "Create and review MongoDB schemas for the application.",
    priority: "high" as const,
    isCompleted: false,
  },
  {
    id: 6,
    task: "Implement error handling",
    description: "Add consistent API error responses and exception handling.",
    priority: "medium" as const,
    isCompleted: false,
  },
  {
    id: 7,
    task: "Add request validation",
    description: "Validate incoming API requests using DTOs.",
    priority: "medium" as const,
    isCompleted: true,
  },
  {
    id: 8,
    task: "Create user profile",
    description: "Build the profile page and user settings.",
    priority: "low" as const,
    isCompleted: false,
  },
  {
    id: 9,
    task: "Add API documentation",
    description: "Document endpoints and request/response structures.",
    priority: "low" as const,
    isCompleted: false,
  },
  {
    id: 10,
    task: "Implement refresh tokens",
    description: "Add secure refresh token rotation to authentication.",
    priority: "high" as const,
    isCompleted: false,
  },
  {
    id: 11,
    task: "Write unit tests",
    description: "Add tests for the task service and authentication flow.",
    priority: "medium" as const,
    isCompleted: false,
  },
  {
    id: 12,
    task: "Deploy development server",
    description: "Deploy the latest development build for testing.",
    priority: "low" as const,
    isCompleted: false,
  },
]

const filters = ["All", "Active", "Completed"] as const

type Filter = (typeof filters)[number]

const priorityStyles = {
  high: {
    dot: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]",
    badge: "border-red-400/15 bg-red-400/[0.07] text-red-300/70",
  },
  medium: {
    dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]",
    badge: "border-amber-400/15 bg-amber-400/[0.07] text-amber-300/70",
  },
  low: {
    dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]",
    badge: "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300/70",
  },
}

export default function TaskPlannerPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All")

  const [showAll, setShowAll] = useState(false)

  const [openMenu, setOpenMenu] = useState<number | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)

  const [completed, setCompleted] = useState<Set<number>>(
    new Set(tasks.filter((task) => task.isCompleted).map((task) => task.id))
  )

  /*
   * Close the task menu when clicking outside it.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleTask = (id: number) => {
    setCompleted((prev) => {
      const next = new Set(prev)

      next.has(id) ? next.delete(id) : next.add(id)

      return next
    })
  }

  const filtered = tasks.filter((task) => {
    if (activeFilter === "Active") {
      return !completed.has(task.id)
    }

    if (activeFilter === "Completed") {
      return completed.has(task.id)
    }

    return true
  })

  const visibleTasks = showAll ? filtered : filtered.slice(0, 4)

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full bg-emerald-500/9 blur-3xl"
      />

      <div
        aria-hidden
        className="pointer-events-none fixed right-1/4 -bottom-16 h-52 w-72 rounded-full bg-emerald-500/6 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

              <span className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
                Task Planner
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
              Your tasks.
              <span className="ml-2 text-white/25">Your focus.</span>
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/35">
              Stay organised, keep your priorities clear, and get things done.
            </p>
          </div>

          <button
            className={cn(
              "group flex h-10 items-center gap-2 rounded-xl px-4",
              "border border-emerald-500/20 bg-emerald-500/8",
              "text-[12.5px] font-semibold text-emerald-400/80",
              "transition-all duration-150",
              "hover:border-emerald-500/35",
              "hover:bg-emerald-500/13",
              "hover:text-emerald-400",
              "active:scale-[0.98]"
            )}
          >
            <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
            Add task
          </button>
        </header>

        {/* Stats */}
        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total",
              value: tasks.length,
              accent: false,
            },
            {
              label: "Completed",
              value: completed.size,
              accent: true,
            },
            {
              label: "In progress",
              value: tasks.length - completed.size,
              accent: false,
            },
            {
              label: "High priority",
              value: tasks.filter(
                (task) => task.priority === "high" && !completed.has(task.id)
              ).length,
              accent: false,
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className={cn(
                "rounded-2xl border p-4 backdrop-blur-xl",
                "border-white/[0.07] bg-white/3"
              )}
            >
              <p className="text-[11px] font-medium text-white/30">{label}</p>

              <p
                className={cn(
                  "mt-1 text-[26px] font-semibold tracking-[-0.03em]",
                  accent ? "text-emerald-400" : "text-white/88"
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* Main card */}
        <section
          className={cn(
            "overflow-visible rounded-3xl",
            "border border-white/[0.07] bg-white/3",
            "shadow-[0_24px_60px_rgba(0,0,0,0.3)]",
            "backdrop-blur-2xl"
          )}
        >
          {/* Toolbar */}
          <div className="flex flex-col gap-4 rounded-t-3xl border-b border-white/6 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-[13px] font-semibold text-white/80">
                All tasks
              </h2>

              <p className="mt-0.5 text-[11px] text-white/25">
                {filtered.length} task
                {filtered.length !== 1 ? "s" : ""} in your workspace
              </p>
            </div>

            <div className="flex items-center gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter)
                    setShowAll(false)
                    setOpenMenu(null)
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5",
                    "text-[11.5px] font-medium",
                    "transition-all duration-150",
                    activeFilter === filter
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400/85"
                      : "border border-transparent text-white/30 hover:bg-white/5 hover:text-white/55"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Task list */}
          <div className="divide-y divide-white/5">
            {visibleTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <p className="text-sm font-medium text-white/20">
                  No tasks here
                </p>

                <p className="text-xs text-white/15">
                  Switch filter or add a new task
                </p>
              </div>
            ) : (
              visibleTasks.map((task) => {
                const isDone = completed.has(task.id)

                const priority = priorityStyles[task.priority]

                const isMenuOpen = openMenu === task.id

                return (
                  <article
                    key={task.id}
                    className="group relative flex items-start gap-3 p-4 transition-colors duration-200 hover:bg-white/2 sm:gap-4 sm:p-5"
                  >
                    {/* Priority */}
                    <div className="shrink-0 pt-1.25">
                      <div
                        className={cn("size-2.5 rounded-full", priority.dot)}
                      />
                    </div>

                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                      className={cn(
                        "mt-px flex size-5 shrink-0",
                        "items-center justify-center rounded-md border",
                        "transition-all duration-150",
                        isDone
                          ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                          : "border-white/[0.14] bg-white/3 hover:border-white/25"
                      )}
                    >
                      {isDone && <CheckIcon className="size-3 stroke-[2.5]" />}
                    </button>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3
                            className={cn(
                              "text-[13.5px] leading-snug font-medium",
                              isDone
                                ? "text-white/25 line-through"
                                : "text-white/85"
                            )}
                          >
                            {task.task}
                          </h3>

                          {task.description && (
                            <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-white/28">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Priority badge */}
                        <span
                          className={cn(
                            "w-fit shrink-0 rounded-full border px-2.5 py-1",
                            "text-[9.5px] font-semibold tracking-widest uppercase",
                            priority.badge
                          )}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      ref={isMenuOpen ? menuRef : undefined}
                      className="relative shrink-0"
                    >
                      <button
                        onClick={() => setOpenMenu(isMenuOpen ? null : task.id)}
                        aria-label="Task options"
                        aria-expanded={isMenuOpen}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg",
                          "text-white/20 transition-all duration-150",
                          "hover:bg-white/[0.07]",
                          "hover:text-white/70",
                          "sm:opacity-0",
                          "sm:group-hover:opacity-100",
                          isMenuOpen &&
                            "bg-white/[0.07] text-white/70 opacity-100"
                        )}
                      >
                        <MoreHorizontal className="size-4" />
                      </button>

                      {/* Context menu */}
                      {isMenuOpen && (
                        <div
                          className={cn(
                            "absolute top-10 right-0 z-50 w-36",
                            "rounded-xl border border-white/9",
                            "bg-[#111318]/90",
                            "p-1.5",
                            "shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                            "backdrop-blur-2xl"
                          )}
                        >
                          {/* Update */}
                          <button
                            onClick={() => {
                              setOpenMenu(null)

                              // TODO:
                              // Open update task dialog
                              console.log("Update task:", task.id)
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5",
                              "rounded-lg px-2.5 py-2",
                              "text-left text-[11.5px]",
                              "text-white/55",
                              "transition-colors",
                              "hover:bg-white/[0.07]",
                              "hover:text-white/90"
                            )}
                          >
                            <Pencil className="size-3.5" />
                            Update
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setOpenMenu(null)

                              // TODO:
                              // Open delete confirmation
                              console.log("Delete task:", task.id)
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5",
                              "rounded-lg px-2.5 py-2",
                              "text-left text-[11.5px]",
                              "text-red-400/60",
                              "transition-colors",
                              "hover:bg-red-400/10",
                              "hover:text-red-400"
                            )}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>

          {/* Footer */}
          {filtered.length > 4 && (
            <div className="flex items-center justify-between rounded-b-3xl border-t border-white/6 px-5 py-4">
              <p className="text-[11px] text-white/20">
                Showing {visibleTasks.length} of {filtered.length} tasks
              </p>

              <button
                onClick={() => setShowAll((prev) => !prev)}
                className={cn(
                  "flex items-center gap-1.5",
                  "text-[11.5px] font-medium",
                  "text-emerald-400/55",
                  "transition-all duration-200",
                  "hover:text-emerald-400/90"
                )}
              >
                {showAll ? (
                  <>
                    Show less
                    <ChevronUp className="size-3.5" />
                  </>
                ) : (
                  <>
                    View all
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
