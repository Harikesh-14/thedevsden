"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Code2,
  FileText,
  FolderKanban,
  Layers3,
  Pencil,
  RefreshCw,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  categoryMeta,
  type ProjectPlan,
  type SkillCategory,
} from "@/lib/project-planner"
import { apiFetch } from "@/lib/api"

interface Props {
  id: string
}

// ── Shared styles ──────────────────────────────────────────────────────────
const panelClass = cn(
  "rounded-2xl border p-5 sm:p-6",
  "border-neutral-200 bg-white shadow-sm shadow-neutral-900/[0.04]",
  "dark:border-white/[0.07] dark:bg-white/[0.035] dark:shadow-none dark:backdrop-blur-xl"
)

const eyebrowClass =
  "text-[9.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-white/35"

const metaIconClass = cn(
  "flex size-8 shrink-0 items-center justify-center rounded-xl",
  "border border-emerald-200/80 bg-emerald-50 text-emerald-600",
  "dark:border-emerald-500/15 dark:bg-emerald-500/[0.07] dark:text-emerald-400"
)

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown date"
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again."
}

// ── Loading skeleton ───────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-transparent">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-16 left-1/4 h-64 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/8"
      />
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 h-3.5 w-40 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10" />
        <div className="mb-3 h-10 w-2/3 animate-pulse rounded-xl bg-neutral-200 dark:bg-white/10" />
        <div className="mb-2 h-4 w-1/3 animate-pulse rounded-full bg-neutral-100 dark:bg-white/5" />
        <div className="mb-8 h-4 w-1/2 animate-pulse rounded-full bg-neutral-100 dark:bg-white/5" />
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className="h-44 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/[0.07] dark:bg-white/3" />
            <div className="h-60 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/[0.07] dark:bg-white/3" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/[0.07] dark:bg-white/3" />
        </div>
      </div>
    </main>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProjectPlanDetailsClient({ id }: Props) {
  const [project, setProject] = useState<ProjectPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProject() {
      setLoading(true)
      setError(null)
      setProject(null)

      try {
        const response = await apiFetch(
          `/new-projects-plan/get/${encodeURIComponent(id)}/`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "PROJECT_NOT_FOUND"
              : "Unable to load this project plan."
          )
        }

        const result: unknown = await response.json()
        const candidate =
          typeof result === "object" && result !== null && "data" in result
            ? result.data
            : result

        if (
          typeof candidate !== "object" ||
          candidate === null ||
          !("_id" in candidate) ||
          !("title" in candidate)
        ) {
          throw new Error("The server returned an invalid project.")
        }

        setProject(candidate as ProjectPlan)
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadProject()
    return () => controller.abort()
  }, [id, retry])

  if (loading) return <LoadingSkeleton />

  // ── Error / not found state ──────────────────────────────────────────────
  if (error || !project) {
    const notFound = error === "PROJECT_NOT_FOUND"

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 dark:bg-transparent">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -top-16 left-1/3 size-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/8"
        />

        <section
          className={cn(panelClass, "relative w-full max-w-md text-center")}
        >
          <div
            className={cn(
              "mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl",
              "border border-emerald-500/20 bg-emerald-50 text-emerald-600",
              "dark:border-emerald-500/15 dark:bg-emerald-500/[0.07] dark:text-emerald-400"
            )}
          >
            {notFound ? (
              <FolderKanban className="size-5" />
            ) : (
              <RefreshCw className="size-5" />
            )}
          </div>

          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white/90">
            {notFound ? "Project not found" : "Couldn't load your project"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-white/40">
            {notFound
              ? "This project plan may have been removed, or the link may be incorrect."
              : (error ?? "Something went wrong. Please try again.")}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!notFound && (
              <button
                type="button"
                onClick={() => setRetry((v) => v + 1)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-colors",
                  "border border-emerald-200 bg-emerald-50 text-emerald-700",
                  "hover:border-emerald-300 hover:bg-emerald-100",
                  "dark:border-emerald-500/25 dark:bg-emerald-500/8 dark:text-emerald-300",
                  "dark:hover:bg-emerald-500/13"
                )}
              >
                <RefreshCw className="size-3.5" />
                Try again
              </button>
            )}
            <Link
              href="/developer-dashboard/project-planner"
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-medium transition-colors",
                "border border-neutral-200 bg-white text-neutral-600",
                "hover:border-neutral-300 hover:bg-neutral-50",
                "dark:border-white/8 dark:bg-white/3 dark:text-white/60",
                "dark:hover:bg-white/[0.07]"
              )}
            >
              <ArrowLeft className="size-3.5" />
              Back to planner
            </Link>
          </div>
        </section>
      </main>
    )
  }

  // ── Data ─────────────────────────────────────────────────────────────────
  const skillEntries = (
    Object.entries(project.skills ?? {}) as [
      SkillCategory,
      string[] | undefined,
    ][]
  ).filter(([, skills]) => (skills?.length ?? 0) > 0)

  const totalSkills = skillEntries.reduce(
    (total, [, skills]) => total + (skills?.length ?? 0),
    0
  )

  const wordCount = project.content.trim()
    ? project.content.trim().split(/\s+/).length
    : 0

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-transparent">
      {/* Ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-20 left-[15%] h-64 w-80 rounded-full bg-emerald-400/18 blur-3xl dark:bg-emerald-500/8"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-[8%] -bottom-20 h-72 w-80 rounded-full bg-emerald-400/12 blur-3xl dark:bg-emerald-500/6"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* ── Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.15em] uppercase"
        >
          <Link
            href="/developer-dashboard/project-planner"
            className="text-neutral-400 transition-colors hover:text-emerald-600 dark:text-white/35 dark:hover:text-emerald-400"
          >
            Project Planner
          </Link>
          <span
            aria-hidden="true"
            className="text-neutral-300 dark:text-white/15"
          >
            /
          </span>
          <span className="max-w-[55%] truncate text-emerald-600/75 dark:text-emerald-400/75">
            {project.title}
          </span>
        </nav>

        {/* ── Header ── */}
        <header className="mb-8">
          {/* Status pill */}
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
                "text-[10px] font-semibold",
                project.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-300"
                  : "border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-white/8 dark:bg-white/4 dark:text-white/40"
              )}
            >
              {project.isActive ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <CircleDot className="size-3" />
              )}
              {project.isActive ? "Active project" : "Draft plan"}
            </span>

            <span className="text-[10px] font-medium text-neutral-400 dark:text-white/30">
              {totalSkills} {totalSkills === 1 ? "technology" : "technologies"}
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-3 text-3xl font-semibold tracking-tight wrap-break-word text-neutral-900 sm:text-4xl dark:text-white/90">
            {project.title}
            <span className="text-emerald-500 dark:text-emerald-400">.</span>
          </h1>

          {project.shortDescription && (
            <p className="mb-5 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-white/45">
              {project.shortDescription}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/developer-dashboard/project-planner"
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-xs font-medium transition-colors",
                "border border-neutral-200 bg-white text-neutral-600",
                "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-800",
                "dark:border-white/8 dark:bg-white/3 dark:text-white/55",
                "dark:hover:bg-white/[0.07] dark:hover:text-white/80"
              )}
            >
              <ArrowLeft className="size-3.5" />
              All plans
            </Link>

            <Link
              href={`/developer-dashboard/project-planner/plan/${id}/edit`}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition-colors",
                "border border-emerald-200 bg-emerald-50 text-emerald-700",
                "hover:border-emerald-300 hover:bg-emerald-100",
                "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-300/90",
                "dark:hover:border-emerald-500/35 dark:hover:bg-emerald-500/[0.14]"
              )}
            >
              <Pencil className="size-3.5" />
              Edit plan
            </Link>
          </div>
        </header>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_272px]">
          {/* Left column */}
          <div className="min-w-0 space-y-4">
            {/* Project overview */}
            <section className={panelClass} aria-labelledby="overview-title">
              <div
                className={cn(
                  "mb-5 flex items-center gap-3 pb-4",
                  "border-b border-neutral-100 dark:border-white/6"
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl",
                    "border border-emerald-200/80 bg-emerald-50 text-emerald-600",
                    "dark:border-emerald-500/15 dark:bg-emerald-500/[0.07] dark:text-emerald-400"
                  )}
                >
                  <FileText className="size-4" />
                </div>
                <div>
                  <h2
                    id="overview-title"
                    className="text-sm font-semibold text-neutral-800 dark:text-white/80"
                  >
                    Project overview
                  </h2>
                  <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-white/30">
                    Scope, goals and implementation notes
                  </p>
                </div>
              </div>

              {project.content.trim() ? (
                <article
                  className={cn(
                    "min-w-0 text-[13.5px] leading-[1.8]",
                    "text-neutral-600",
                    "dark:text-white/60",
                    // Headings
                    "[&_h1]:mt-7 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight",
                    "[&_h1]:text-neutral-900 dark:[&_h1]:text-white/90",
                    "[&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:text-[15px] [&_h2]:font-semibold",
                    "[&_h2]:border-neutral-100 [&_h2]:text-neutral-800",
                    "dark:[&_h2]:border-white/6 dark:[&_h2]:text-white/85",
                    "[&_h2:first-child]:mt-0",
                    "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold",
                    "[&_h3]:text-neutral-700 dark:[&_h3]:text-white/80",
                    // Body
                    "[&_p]:mb-4 [&_p]:last:mb-0",
                    "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
                    "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
                    "[&_li]:pl-0.5",
                    // Inline elements
                    "[&_a]:text-emerald-700 [&_a]:underline [&_a]:underline-offset-4 dark:[&_a]:text-emerald-400",
                    "[&_strong]:font-semibold [&_strong]:text-neutral-800 dark:[&_strong]:text-white/85",
                    "[&_em]:text-neutral-500 dark:[&_em]:text-white/50",
                    // Blockquote
                    "[&_blockquote]:my-4 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-2",
                    "[&_blockquote]:border-emerald-400/50 [&_blockquote]:bg-emerald-50/50 [&_blockquote]:px-4 [&_blockquote]:py-3",
                    "[&_blockquote]:text-neutral-600",
                    "dark:[&_blockquote]:border-emerald-500/30 dark:[&_blockquote]:bg-emerald-500/4 dark:[&_blockquote]:text-white/50",
                    // HR
                    "[&_hr]:my-6 [&_hr]:border-neutral-200 dark:[&_hr]:border-white/8",
                    // Code blocks
                    "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:p-4",
                    "[&_pre]:border-neutral-200 [&_pre]:bg-neutral-50",
                    "dark:[&_pre]:border-white/[0.07] dark:[&_pre]:bg-black/20",
                    // Inline code
                    "[&_code]:rounded-md [&_code]:border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px]",
                    "[&_code]:border-neutral-200 [&_code]:bg-neutral-100 [&_code]:text-neutral-700",
                    "dark:[&_code]:border-white/[0.07] dark:[&_code]:bg-white/[0.07] dark:[&_code]:text-white/75",
                    "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0"
                  )}
                >
                  <ReactMarkdown>{project.content}</ReactMarkdown>
                </article>
              ) : (
                <div
                  className={cn(
                    "rounded-xl border border-dashed px-4 py-12 text-center",
                    "border-neutral-200 dark:border-white/8"
                  )}
                >
                  <FileText className="mx-auto mb-3 size-5 text-neutral-300 dark:text-white/20" />
                  <p className="text-xs text-neutral-400 dark:text-white/35">
                    No project documentation yet.
                  </p>
                  <Link
                    href={`/developer-dashboard/project-planner/plan/${id}/edit`}
                    className="mt-3 inline-flex text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Add documentation →
                  </Link>
                </div>
              )}
            </section>

            {/* Technology stack */}
            {skillEntries.length > 0 && (
              <section className={panelClass} aria-labelledby="stack-title">
                <div
                  className={cn(
                    "mb-5 flex items-center gap-3 pb-4",
                    "border-b border-neutral-100 dark:border-white/6"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl",
                      "border border-emerald-200/80 bg-emerald-50 text-emerald-600",
                      "dark:border-emerald-500/15 dark:bg-emerald-500/[0.07] dark:text-emerald-400"
                    )}
                  >
                    <Layers3 className="size-4" />
                  </div>
                  <div>
                    <h2
                      id="stack-title"
                      className="text-sm font-semibold text-neutral-800 dark:text-white/80"
                    >
                      Technology stack
                    </h2>
                    <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-white/30">
                      {totalSkills}{" "}
                      {totalSkills === 1 ? "technology" : "technologies"} across{" "}
                      {skillEntries.length}{" "}
                      {skillEntries.length === 1 ? "category" : "categories"}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {skillEntries.map(([category, skills]) => {
                    const meta = categoryMeta[category]
                    if (!meta || !skills?.length) return null
                    const Icon = meta.icon

                    return (
                      <div key={category}>
                        <div className="mb-2.5 flex items-center gap-2">
                          <Icon className="size-3.5 text-neutral-400 dark:text-white/35" />
                          <h3 className="text-[10px] font-semibold tracking-[0.12em] text-neutral-400 uppercase dark:text-white/40">
                            {meta.label}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className={cn(
                                "rounded-[6px] border px-2 py-0.5 text-[11px] font-medium",
                                meta.chip
                              )}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="min-w-0">
            <section
              className={cn(panelClass, "lg:sticky lg:top-6")}
              aria-labelledby="glance-title"
            >
              <div
                className={cn(
                  "mb-4 flex items-center gap-2 pb-4",
                  "border-b border-neutral-100 dark:border-white/6"
                )}
              >
                <Code2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2
                  id="glance-title"
                  className="text-sm font-semibold text-neutral-800 dark:text-white/80"
                >
                  At a glance
                </h2>
              </div>

              <div className="space-y-1">
                {/* Status */}
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3",
                    "transition-colors hover:bg-neutral-50 dark:hover:bg-white/3"
                  )}
                >
                  <div className={metaIconClass}>
                    <CircleDot className="size-3.5" />
                  </div>
                  <div>
                    <p className={eyebrowClass}>Status</p>
                    <p className="mt-0.5 text-xs font-semibold text-neutral-700 dark:text-white/75">
                      {project.isActive ? "Active project" : "Draft plan"}
                    </p>
                  </div>
                </div>

                {/* Last updated */}
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3",
                    "transition-colors hover:bg-neutral-50 dark:hover:bg-white/3"
                  )}
                >
                  <div className={metaIconClass}>
                    <CalendarDays className="size-3.5" />
                  </div>
                  <div>
                    <p className={eyebrowClass}>Last updated</p>
                    <p className="mt-0.5 text-xs font-semibold text-neutral-700 dark:text-white/75">
                      {formatDate(project.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Tech categories */}
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3",
                    "transition-colors hover:bg-neutral-50 dark:hover:bg-white/3"
                  )}
                >
                  <div className={metaIconClass}>
                    <Layers3 className="size-3.5" />
                  </div>
                  <div>
                    <p className={eyebrowClass}>Tech categories</p>
                    <p className="mt-0.5 text-xs font-semibold text-neutral-700 dark:text-white/75">
                      {skillEntries.length}{" "}
                      {skillEntries.length === 1 ? "category" : "categories"}
                    </p>
                  </div>
                </div>

                {/* Documentation */}
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3",
                    "transition-colors hover:bg-neutral-50 dark:hover:bg-white/3"
                  )}
                >
                  <div className={metaIconClass}>
                    <Clock3 className="size-3.5" />
                  </div>
                  <div>
                    <p className={eyebrowClass}>Documentation</p>
                    <p className="mt-0.5 text-xs font-semibold text-neutral-700 dark:text-white/75">
                      {wordCount > 0
                        ? `${wordCount.toLocaleString()} words`
                        : "Empty"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
