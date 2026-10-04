"use client"

import { ArrowLeft, Compass, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function UpdateTaskPage() {
  const router = useRouter()

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 font-sans text-neutral-800 transition-colors duration-300 dark:bg-neutral-950 dark:text-white/90">
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-24 left-1/3 h-72 w-96 rounded-full bg-emerald-500/15 blur-[120px] dark:bg-emerald-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed right-1/4 bottom-0 h-64 w-80 rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5"
      />

      <div className="relative mx-auto w-full max-w-lg">
        {/* Top Tag */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-600 backdrop-blur-md dark:border-emerald-500/20 dark:text-emerald-400">
            <Sparkles className="size-3.5" />
            <span>404 (Well, not really, but kinda)</span>
          </div>
        </div>

        {/* Main Card */}
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl p-6 sm:p-8",
            "border border-black/8 bg-white/70 shadow-[0_24px_60px_rgba(0,0,0,0.06)] backdrop-blur-2xl",
            "dark:border-white/8 dark:bg-white/2 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
          )}
        >
          {/* Subtle top border glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/40 to-transparent dark:via-emerald-500/30" />

          {/* Terminal / Code Visual */}
          <div className="mb-6 rounded-2xl border border-black/10 bg-neutral-900 p-4 font-mono text-[12px] leading-relaxed text-neutral-200 dark:border-white/10 dark:bg-black/40 dark:text-white/70">
            <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-2 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500/80" />
                <span className="size-2.5 rounded-full bg-amber-500/80" />
                <span className="size-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-white/30">
                task-planner.ts
              </span>
            </div>
            <p className="text-emerald-400">
              $ GET /developer-dashboard/task-planner/update-task
            </p>
            <p className="mt-1 text-red-400">
              ❌ Error: Where&apos;s the task ID bestie?
            </p>
            <p className="mt-1 text-neutral-400 dark:text-white/40">
              // Bro thought he could update a ghost task 💀
            </p>
          </div>

          {/* Content */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
              This page doesn&apos;t work <br />
              <span className="text-emerald-600 dark:text-emerald-400">
                like you think it does.
              </span>
            </h1>

            <p className="mt-3 text-[13px] leading-relaxed text-neutral-600 dark:text-white/50">
              Nice try telephoning into the raw route! To update a task, you
              actually need to select an actual task first so we know which one
              you&apos;re trying to fix.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => router.back()}
                className={cn(
                  "flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 sm:w-auto",
                  "border border-black/10 bg-neutral-100 text-neutral-700",
                  "hover:bg-neutral-200 hover:text-neutral-900",
                  "dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white",
                  "text-[12px] font-medium transition-all duration-150 active:scale-[0.98]"
                )}
              >
                <ArrowLeft className="size-4" />
                Go back
              </button>

              <Link
                href="/developer-dashboard/task-planner"
                className={cn(
                  "flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 sm:w-auto",
                  "border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300 dark:hover:text-emerald-200",
                  "shadow-[0_0_20px_rgba(52,211,153,0.15)]",
                  "text-[12px] font-semibold transition-all duration-150 active:scale-[0.98]"
                )}
              >
                <Compass className="size-4" />
                Pick a real task
              </Link>
            </div>
          </div>
        </div>

        {/* Footer meme tag */}
        <p className="mt-6 text-center text-[11px] text-neutral-400 dark:text-white/20">
          Maintained by the{" "}
          <code className="rounded bg-neutral-200/60 px-1 py-0.5 text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
            no-id-no-entry
          </code>{" "}
          gang
        </p>
      </div>
    </main>
  )
}
