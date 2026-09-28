"use client"

import { CalendarDays, LayoutDashboard, ListTodo, Map } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"

const THOUGHT_OF_THE_DAY = {
  quote: "The best way to predict the future is to invent it.",
  author: "Alan Kay",
}

const quickLinks = [
  {
    label: "Project Planner",
    href: "/project-planner",
    icon: LayoutDashboard,
    meta: "3 active projects",
  },
  {
    label: "Task Planner",
    href: "/task-planner",
    icon: ListTodo,
    meta: "7 tasks pending",
  },
  {
    label: "Roadmap",
    href: "/roadmap",
    icon: Map,
    meta: "Next milestone: v2.0",
  },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function DeveloperDashboardPage() {
  const router = useRouter()

  const { user, loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-8 py-16">
      <div className="w-full max-w-2xl">
        {/* Top meta row */}
        <div className="mb-10 flex items-center gap-3">
          <span
            className={cn(
              "rounded-full border border-emerald-500/20 bg-emerald-500/8",
              "px-3 py-1 text-[10px] font-semibold tracking-widest uppercase",
              "text-emerald-500 dark:text-emerald-400"
            )}
          >
            Developer Dashboard
          </span>
          <span className="size-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-600">
            <CalendarDays className="size-3.5" />
            {getFormattedDate()}
          </span>
        </div>

        {/* Greeting + headline */}
        <p className="mb-1 text-sm font-medium text-neutral-400 dark:text-neutral-600">
          {getGreeting()},
        </p>
        <h1
          className={cn(
            "text-[clamp(32px,5vw,48px)] leading-[1.1] font-semibold tracking-[-0.03em]",
            "text-neutral-900 dark:text-neutral-100",
            "mb-3"
          )}
        >
          Welcome back,{" "}
          <span className="text-emerald-500 dark:text-emerald-400">
            Harikesh.
          </span>
        </h1>
        <p className="mb-14 text-sm text-neutral-400 dark:text-neutral-500">
          Here's what's on for today.
        </p>

        {/* Emerald fade divider */}
        <div className="mb-10 h-px bg-linear-to-r from-emerald-500/30 via-emerald-500/10 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/5" />

        {/* Thought of the day */}
        <p
          className={cn(
            "mb-5 flex items-center gap-3",
            "text-[10px] font-bold tracking-[0.14em] uppercase",
            "text-emerald-600/60 dark:text-emerald-500/50",
            "after:h-px after:flex-1 after:bg-neutral-100 dark:after:bg-neutral-800"
          )}
        >
          Thought of the day
        </p>

        <div className="mb-2 border-l-2 border-emerald-500/40 pl-5 dark:border-emerald-500/30">
          <p
            className={cn(
              "text-[19px] leading-relaxed font-normal italic",
              "text-neutral-700 dark:text-neutral-300"
            )}
          >
            &ldquo;{THOUGHT_OF_THE_DAY.quote}&rdquo;
          </p>
        </div>
        <p className="pl-5 text-xs font-semibold tracking-widest text-emerald-600/60 uppercase dark:text-emerald-500/50">
          — {THOUGHT_OF_THE_DAY.author}
        </p>

        {/* Quick-access cards */}
        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map(({ label, href, icon: Icon, meta }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "group rounded-2xl border p-4 transition-all duration-150",
                "border-neutral-200/70 bg-neutral-50/60",
                "dark:border-white/6 dark:bg-white/3",
                "hover:border-emerald-200/80 hover:bg-emerald-50/40",
                "dark:hover:border-emerald-900/60 dark:hover:bg-emerald-950/20"
              )}
            >
              <div
                className={cn(
                  "mb-3 flex size-8 items-center justify-center rounded-xl",
                  "border border-emerald-200/80 bg-emerald-50",
                  "dark:border-emerald-900/60 dark:bg-emerald-950/60",
                  "transition-colors duration-150",
                  "group-hover:border-emerald-300/80 dark:group-hover:border-emerald-800"
                )}
              >
                <Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[12.5px] font-semibold text-neutral-800 dark:text-neutral-200">
                {label}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-600">
                {meta}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
