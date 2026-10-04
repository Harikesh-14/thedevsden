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
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { ITask } from "@/lib/task-planner"

const filters = ["All", "Active", "Completed"] as const

type Filter = (typeof filters)[number]

const priorityStyles = {
  high: {
    dot: "bg-red-500 dark:bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]",
    badge:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:border-red-400/15 dark:bg-red-400/[0.07] dark:text-red-300/70",
  },
  medium: {
    dot: "bg-amber-500 dark:bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]",
    badge:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/[0.07] dark:text-amber-300/70",
  },
  low: {
    dot: "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]",
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/[0.07] dark:text-emerald-300/70",
  },
}

export default function TaskPlannerPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All")
  const [showAll, setShowAll] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [tasks, setTasks] = useState<ITask[]>([])
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const menuRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  async function fetchTasks() {
    try {
      const response = await apiFetch("/task-manager", {
        method: "GET",
      })

      if (!response.ok) {
        toast.error("Oops", {
          description: "Failed to load the tasks",
          closeButton: true,
        })

        return
      }

      const data: ITask[] = await response.json()

      setTasks(data)

      setCompleted(
        new Set(data.filter((task) => task.isCompleted).map((task) => task._id))
      )
    } catch (error) {
      console.error("Failed to fetch tasks:", error)

      toast.error("Oops", {
        description: "Failed to load the tasks",
        closeButton: true,
      })
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

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

  const toggleTask = async (_id: string) => {
    const isCompleted = completed.has(_id)

    const response = await apiFetch(`/task-manager/${_id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        isCompleted: !isCompleted,
      }),
    })

    if (!response.ok) {
      toast.error("Oops", {
        description: "Failed to update task status",
        closeButton: true,
      })

      return
    }

    setCompleted((prev) => {
      const next = new Set(prev)

      next.has(_id) ? next.delete(_id) : next.add(_id)

      return next
    })
  }

  const filtered = tasks.filter((task) => {
    if (activeFilter === "Active") {
      return !completed.has(task._id)
    }

    if (activeFilter === "Completed") {
      return completed.has(task._id)
    }

    return true
  })

  const visibleTasks = showAll ? filtered : filtered.slice(0, 4)

  async function deleteTask(_id: string) {
    const response = await apiFetch(`/task-manager/${_id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      toast.error("Oops", {
        description: "Failed to update task status",
        closeButton: true,
      })

      return
    }

    setTasks((prev) => prev.filter((task) => task._id !== _id))

    setCompleted((prev) => {
      const next = new Set(prev)
      next.delete(_id)
      return next
    })

    toast.success("Yeyy", {
      description: "Task deleted successfully",
      closeButton: true,
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white font-sans text-neutral-800 transition-colors duration-300 dark:bg-neutral-950 dark:text-white/90">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full bg-emerald-500/15 blur-3xl dark:bg-emerald-500/9"
      />

      <div
        aria-hidden
        className="pointer-events-none fixed right-1/4 -bottom-16 h-52 w-72 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/6"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.8)] dark:bg-emerald-400" />

              <span className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase dark:text-white/35">
                Task Planner
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white/90">
              Your tasks.
              <span className="ml-2 text-neutral-400 dark:text-white/25">
                Your focus.
              </span>
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600 dark:text-white/35">
              Stay organised, keep your priorities clear, and get things done.
            </p>
          </div>

          <button
            className={cn(
              "group flex h-10 items-center gap-2 rounded-xl px-4",
              "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
              "transition-all duration-150",
              "hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-800",
              "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-400/80 dark:hover:border-emerald-500/35 dark:hover:bg-emerald-500/13 dark:hover:text-emerald-400",
              "text-[12.5px] font-semibold active:scale-[0.98]"
            )}
            onClick={() =>
              router.push("/developer-dashboard/task-planner/add-task")
            }
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
                (task) => task.priority === "high" && !completed.has(task._id)
              ).length,
              accent: false,
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className={cn(
                "rounded-2xl border p-4 backdrop-blur-xl",
                "border-black/8 bg-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
                "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none"
              )}
            >
              <p className="text-[11px] font-medium text-neutral-500 dark:text-white/30">
                {label}
              </p>

              <p
                className={cn(
                  "mt-1 text-[26px] font-semibold tracking-[-0.03em]",
                  accent
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-900 dark:text-white/88"
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
            "border border-black/8 bg-white/70 shadow-[0_24px_60px_rgba(0,0,0,0.05)] backdrop-blur-2xl",
            "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
          )}
        >
          {/* Toolbar */}
          <div className="flex flex-col gap-4 rounded-t-3xl border-b border-black/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-white/6">
            <div>
              <h2 className="text-[13px] font-semibold text-neutral-800 dark:text-white/80">
                All tasks
              </h2>

              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-white/25">
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
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400/85"
                      : "border border-transparent text-neutral-500 hover:bg-black/5 hover:text-neutral-800 dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white/55"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Task list */}
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {visibleTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <p className="text-sm font-medium text-neutral-400 dark:text-white/20">
                  No tasks here
                </p>

                <p className="text-xs text-neutral-400/70 dark:text-white/15">
                  Switch filter or add a new task
                </p>
              </div>
            ) : (
              visibleTasks.map((task) => {
                const isDone = completed.has(task._id)

                const priority =
                  priorityStyles[task.priority as keyof typeof priorityStyles]

                const isMenuOpen = openMenu === task._id

                return (
                  <article
                    key={task._id}
                    className="group relative flex items-start gap-3 p-4 transition-colors duration-200 hover:bg-black/2 sm:gap-4 sm:p-5 dark:hover:bg-white/2"
                  >
                    {/* Priority */}
                    <div className="shrink-0 pt-1.25">
                      <div
                        className={cn("size-2.5 rounded-full", priority.dot)}
                      />
                    </div>

                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task._id)}
                      aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                      className={cn(
                        "mt-px flex size-5 shrink-0",
                        "items-center justify-center rounded-md border",
                        "transition-all duration-150",
                        isDone
                          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-400/15 dark:text-emerald-300"
                          : "border-black/20 bg-black/5 hover:border-black/30 dark:border-white/[0.14] dark:bg-white/3 dark:hover:border-white/25"
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
                                ? "text-neutral-400 line-through dark:text-white/25"
                                : "text-neutral-900 dark:text-white/85"
                            )}
                          >
                            {task.task}
                          </h3>

                          {task.description && (
                            <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-neutral-500 dark:text-white/28">
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
                        onClick={() =>
                          setOpenMenu(isMenuOpen ? null : task._id)
                        }
                        aria-label="Task options"
                        aria-expanded={isMenuOpen}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg",
                          "text-neutral-400 transition-all duration-150 dark:text-white/20",
                          "hover:bg-black/5 hover:text-neutral-700 dark:hover:bg-white/[0.07] dark:hover:text-white/70",
                          "sm:opacity-0",
                          "sm:group-hover:opacity-100",
                          isMenuOpen &&
                            "bg-black/5 text-neutral-700 opacity-100 dark:bg-white/[0.07] dark:text-white/70"
                        )}
                      >
                        <MoreHorizontal className="size-4" />
                      </button>

                      {/* Context menu */}
                      {isMenuOpen && (
                        <div
                          className={cn(
                            "absolute top-10 right-0 z-50 w-36",
                            "rounded-xl border p-1.5 backdrop-blur-2xl",
                            "border-black/10 bg-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.1)]",
                            "dark:border-white/9 dark:bg-[#111318]/90 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                          )}
                        >
                          {/* Update */}
                          <button
                            onClick={() => {
                              setOpenMenu(null)
                              router.push(
                                `/developer-dashboard/task-planner/update-task/${task._id}`
                              )
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5",
                              "rounded-lg px-2.5 py-2",
                              "text-left text-[11.5px]",
                              "text-neutral-700 hover:bg-black/5 hover:text-neutral-900",
                              "dark:text-white/55 dark:hover:bg-white/[0.07] dark:hover:text-white/90",
                              "transition-colors"
                            )}
                          >
                            <Pencil className="size-3.5" />
                            Update
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setOpenMenu(null)
                              deleteTask(task._id)
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5",
                              "rounded-lg px-2.5 py-2",
                              "text-left text-[11.5px]",
                              "text-red-600 hover:bg-red-500/10 hover:text-red-700",
                              "dark:text-red-400/60 dark:hover:bg-red-400/10 dark:hover:text-red-400",
                              "transition-colors"
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
            <div className="flex items-center justify-between rounded-b-3xl border-t border-black/5 px-5 py-4 dark:border-white/6">
              <p className="text-[11px] text-neutral-500 dark:text-white/20">
                Showing {visibleTasks.length} of {filtered.length} tasks
              </p>

              <button
                onClick={() => setShowAll((prev) => !prev)}
                className={cn(
                  "flex items-center gap-1.5",
                  "text-[11.5px] font-medium",
                  "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400/55 dark:hover:text-emerald-400/90",
                  "transition-all duration-200"
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
