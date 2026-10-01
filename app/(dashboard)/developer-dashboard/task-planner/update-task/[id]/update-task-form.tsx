"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, CalendarDays, Check, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"

const priorities = [
  {
    value: "low",
    label: "Low",
    description: "Can wait",
    dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]",
    active: "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Worth doing soon",
    dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]",
    active: "border-amber-400/25 bg-amber-400/[0.08] text-amber-300",
  },
  {
    value: "high",
    label: "High",
    description: "Needs attention",
    dot: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]",
    active: "border-red-400/25 bg-red-400/[0.08] text-red-300",
  },
] as const

type Priority = (typeof priorities)[number]["value"]

export function TaskUpdateForm({ id }: { id: string }) {
  const router = useRouter()

  // Strict initial string state guarantee
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [dueDate, setDueDate] = useState<string>("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return

    let isMounted = true

    const fetchTask = async () => {
      try {
        const response = await apiFetch(`/task-manager/${id}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}`)
        }

        const data = await response.json()

        if (isMounted && data) {
          setTitle(data.task ?? "")
          setDescription(data.description ?? "")
          setPriority((data.priority as Priority) || "medium")

          if (data.dueDate) {
            const formattedDate = new Date(data.dueDate).toISOString().split("T")[0]
            setDueDate(formattedDate)
          } else {
            setDueDate("")
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Error", {
            description:
              error instanceof Error ? error.message : "Failed to load task",
            closeButton: true,
          })
          router.back()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTask()

    return () => {
      isMounted = false
    }
  }, [id, router])

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title || !title.trim()) return

    setSaving(true)

    try {
      const response = await apiFetch(`/task-manager/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          task: title,
          description,
          priority,
          dueDate,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task")
      }

      toast.success("Updated!", {
        description: "Task updated successfully",
        closeButton: true,
      })

      router.back()
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to update task",
        closeButton: true,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none fixed -top-24 left-1/3 h-64 w-96 rounded-full bg-emerald-500/8 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed right-1/4 bottom-0 h-56 w-80 rounded-full bg-emerald-500/5 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-6 h-4 w-28 rounded bg-white/5" />
            <div className="mb-3 h-10 w-80 rounded bg-white/5" />
            <div className="h-4 w-96 rounded bg-white/5" />
          </div>
        </div>
      </main>
    )
  }

  // Safe evaluation variable
  const isTitleEmpty = typeof title !== "string" || title.trim().length === 0

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed -top-24 left-1/3 h-64 w-96 rounded-full bg-emerald-500/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed right-1/4 bottom-0 h-56 w-80 rounded-full bg-emerald-500/5 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <button
            onClick={() => router.back()}
            className={cn(
              "mb-6 flex items-center gap-2",
              "text-[11.5px] font-medium text-white/30",
              "transition-colors duration-150",
              "hover:text-white/65",
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to tasks
          </button>

          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
              Task Planner
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
            Update your task.
            <span className="ml-2 text-white/25">Keep it moving.</span>
          </h1>

          <p className="mt-2 max-w-md text-sm leading-6 text-white/35">
            Make the changes you need and keep your next step clear.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className={cn(
            "overflow-hidden rounded-3xl",
            "border border-white/[0.07] bg-white/3",
            "shadow-[0_24px_60px_rgba(0,0,0,0.3)]",
            "backdrop-blur-2xl",
          )}
        >
          <div className="border-b border-white/6 px-5 py-4 sm:px-6">
            <h2 className="text-[13px] font-semibold text-white/80">
              Task details
            </h2>
            <p className="mt-0.5 text-[11px] text-white/25">
              Update the details of your task.
            </p>
          </div>

          <div className="space-y-7 p-5 sm:p-6">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-[11px] font-medium text-white/45"
              >
                Task title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className={cn(
                  "h-11 w-full rounded-xl px-3.5",
                  "border border-white/8 bg-white/3",
                  "text-[13px] text-white/85",
                  "placeholder:text-white/20",
                  "outline-none transition-all duration-150",
                  "focus:border-emerald-500/30 focus:bg-white/4 focus:ring-2 focus:ring-emerald-500/5",
                )}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-[11px] font-medium text-white/45"
              >
                Description
                <span className="ml-1 text-white/20">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some context..."
                rows={4}
                className={cn(
                  "w-full resize-none rounded-xl px-3.5 py-3",
                  "border border-white/8 bg-white/3",
                  "text-[13px] leading-6 text-white/85",
                  "placeholder:text-white/20",
                  "outline-none transition-all duration-150",
                  "focus:border-emerald-500/30 focus:bg-white/4 focus:ring-2 focus:ring-emerald-500/5",
                )}
              />
            </div>

            <div>
              <div className="mb-3">
                <p className="text-[11px] font-medium text-white/45">Priority</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {priorities.map((item) => {
                  const isSelected = priority === item.value

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPriority(item.value)}
                      className={cn(
                        "relative rounded-xl border p-3 text-left",
                        "transition-all duration-150",
                        isSelected
                          ? item.active
                          : "border-white/[0.07] bg-white/2 hover:border-white/13 hover:bg-white/4",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", item.dot)} />
                        <span
                          className={cn(
                            "text-[11.5px] font-medium",
                            isSelected ? "text-white/80" : "text-white/45",
                          )}
                        >
                          {item.label}
                        </span>
                        {isSelected && (
                          <Check className="ml-auto size-3 text-white/50" />
                        )}
                      </div>
                      <p className="mt-1.5 pl-4 text-[10px] text-white/20">
                        {item.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="mb-2 block text-[11px] font-medium text-white/45"
              >
                Due date
                <span className="ml-1 text-white/20">(optional)</span>
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-white/25" />
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={cn(
                    "h-11 w-full rounded-xl pl-10 pr-3.5",
                    "border border-white/8 bg-white/3",
                    "text-[12px] text-white/60",
                    "outline-none transition-all duration-150",
                    "focus:border-emerald-500/30 focus:bg-white/4 focus:ring-2 focus:ring-emerald-500/5",
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/6 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                "h-10 rounded-xl px-4",
                "text-[11.5px] font-medium text-white/35",
                "transition-all duration-150",
                "hover:bg-white/5 hover:text-white/60",
              )}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isTitleEmpty || saving}
              className={cn(
                "group flex h-10 items-center gap-2 rounded-xl px-4",
                "border border-emerald-500/20 bg-emerald-500/10",
                "text-[11.5px] font-semibold text-emerald-400/80",
                "transition-all duration-150",
                "hover:border-emerald-500/35 hover:bg-emerald-500/15 hover:text-emerald-400",
                "active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-30",
              )}
            >
              <Save className="size-3.5" />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}