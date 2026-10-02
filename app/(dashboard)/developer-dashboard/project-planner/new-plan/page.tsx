"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Bold, Code, Code2,
  Heading1, Heading2, Italic, Link2, List, ListOrdered,
  Minus, Save,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Category, STACK } from "@/lib/project-planner"

// ── Markdown toolbar actions ────────────────────────────────────────────────
function insertMarkdown(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix = "",
  placeholder = "text"
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const sel = textarea.value.slice(start, end) || placeholder
  const before = textarea.value.slice(0, start)
  const after = textarea.value.slice(end)
  const inserted = `${prefix}${sel}${suffix}`
  textarea.value = before + inserted + after
  textarea.selectionStart = start + prefix.length
  textarea.selectionEnd = start + prefix.length + sel.length
  textarea.focus()
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
}

const MD_ACTIONS = [
  { icon: Bold, label: "Bold", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "**", "**") },
  { icon: Italic, label: "Italic", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "_", "_") },
  { icon: Code, label: "Inline code", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "`", "`") },
  null, // separator
  { icon: Heading1, label: "H1", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "# ") },
  { icon: Heading2, label: "H2", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "## ") },
  null,
  { icon: Minus, label: "Divider", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "\n---\n") },
  { icon: List, label: "Bullet list", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "- ") },
  { icon: ListOrdered, label: "Numbered list", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "1. ") },
  null,
  { icon: Link2, label: "Link", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "[", "](url)") },
  { icon: Code2, label: "Code block", action: (t: HTMLTextAreaElement) => insertMarkdown(t, "```\n", "\n```") },
] as const

// ── Page ───────────────────────────────────────────────────────────────────
export default function NewProjectPlanPage() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState("")
  const [tagline, setTagline] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)

  const [selected, setSelected] = useState<Partial<Record<Category, Set<string>>>>(
    {} as Partial<Record<Category, Set<string>>>
  )

  function toggleChip(cat: Category, val: string) {
    setSelected((prev) => {
      const set = new Set(prev[cat] ?? [])
      set.has(val) ? set.delete(val) : set.add(val)
      return { ...prev, [cat]: set }
    })
  }

  function buildSkills() {
    return Object.fromEntries(
      (Object.keys(STACK) as Category[]).map((k) => [k, [...(selected[k] ?? [])]])
    )
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    // TODO: POST to your NestJS endpoint
    const payload = { title, content, skills: buildSkills() }
    console.log("Saving plan:", payload)
    await new Promise((r) => setTimeout(r, 900))
    setSaving(false)
    router.push("/developer-dashboard/project-planner")
  }

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Glows */}
      <div aria-hidden className="pointer-events-none fixed -top-16 left-1/4  h-56 w-80 rounded-full bg-emerald-500/9 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed -bottom-16 right-1/4 h-52 w-72 rounded-full bg-emerald-500/6 blur-3xl" />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Project Planner
            </span>
            <span className="text-white/15">/</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-500/60">
              New plan
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            New project plan.
            <span className="ml-2 text-white/25">Start from scratch.</span>
          </h1>
          <p className="mt-2 text-sm text-white/35">
            Define the scope, pick your stack, and document the vision.
          </p>
        </header>

        {/* ── Title + tagline ── */}
        <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/30">
              Project title <span className="text-red-400/60">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blooplingo, DevCLI…"
              className={cn(
                "h-10 w-full rounded-xl px-4",
                "border border-white/[0.07] bg-white/3",
                "text-[13px] text-white/70 placeholder:text-white/20",
                "outline-none backdrop-blur-xl",
                "focus:border-emerald-500/30 focus:bg-emerald-500/4",
                "transition-colors duration-150"
              )}
            />
          </div>
          <div>
            <label className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/30">
              Short description
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="One line about the project"
              className={cn(
                "h-10 w-full rounded-xl px-4",
                "border border-white/[0.07] bg-white/3",
                "text-[13px] text-white/70 placeholder:text-white/20",
                "outline-none backdrop-blur-xl",
                "focus:border-emerald-500/30 focus:bg-emerald-500/4",
                "transition-colors duration-150"
              )}
            />
          </div>
        </div>

        {/* ── Tech stack ── */}
        <div
          className={cn(
            "mb-3.5 rounded-[18px] border border-white/[0.07] bg-white/3",
            "p-5 backdrop-blur-xl"
          )}
        >
          <p className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            <Code2 className="size-3.5 text-emerald-500/60" />
            Tech stack
            <span className="text-white/15">— select all that apply</span>
          </p>

          <div className="space-y-5">
            {(Object.entries(STACK) as [Category, typeof STACK[Category]][]).map(([cat, meta]) => {
              const sel = selected[cat] ?? new Set<string>()
              return (
                <div key={cat}>
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className={cn("size-1.5 rounded-full", meta.color.dot)} />
                    <span className="text-[10.5px] font-medium text-white/30">{meta.label}</span>
                    {sel.size > 0 && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-1.5 py-px text-[9px] font-semibold text-emerald-400/70">
                        {sel.size}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {meta.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggleChip(cat, opt)}
                        className={cn(
                          "rounded-[7px] border px-2.5 py-1 text-[11px] font-medium",
                          "transition-all duration-100",
                          sel.has(opt)
                            ? meta.color.sel
                            : "border-white/[0.07] bg-white/3 text-white/30 hover:border-white/[0.14] hover:text-white/55"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Markdown content editor ── */}
        <div
          className={cn(
            "mb-4 overflow-hidden rounded-[18px]",
            "border border-white/[0.07] bg-white/3 backdrop-blur-xl"
          )}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 border-b border-white/6 px-3 py-2.5">
            {MD_ACTIONS.map((action, i) =>
              action === null ? (
                <div key={i} className="mx-1 h-4 w-px bg-white/[0.07]" />
              ) : (
                <button
                  key={action.label}
                  title={action.label}
                  onClick={() => textareaRef.current && action.action(textareaRef.current)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md",
                    "text-white/30 transition-colors duration-100",
                    "hover:bg-white/[0.07] hover:text-white/65"
                  )}
                >
                  <action.icon className="size-3.5" />
                </button>
              )
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`## Overview\n\nDescribe your project idea, goals, and scope here...\n\n## Features\n\n- Feature one\n- Feature two\n\n## Notes`}
            rows={14}
            className={cn(
              "w-full resize-none bg-transparent px-5 py-4",
              "font-mono text-[13px] leading-[1.75] text-white/65",
              "placeholder:text-white/18 outline-none"
            )}
          />

          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-white/6 px-4 py-2.5">
            <Link2 className="size-3 text-emerald-500/40" />
            <span className="text-[10.5px] text-white/20">
              Markdown supported
            </span>
            {content.length > 0 && (
              <span className="ml-auto text-[10px] text-white/15">
                {content.length} chars
              </span>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/developer-dashboard/project-planner"
            className="flex items-center gap-2 text-[12px] text-white/25 transition-colors hover:text-white/50"
          >
            <ArrowLeft className="size-3.5" />
            Back to planner
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className={cn(
                "h-9 rounded-xl border border-white/[0.07] bg-transparent px-4",
                "text-[12.5px] font-medium text-white/30",
                "hover:bg-white/5 hover:text-white/55 transition-all duration-150"
              )}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className={cn(
                "flex h-9 items-center gap-2 rounded-xl px-5",
                "border border-emerald-500/20 bg-emerald-500/9",
                "text-[12.5px] font-semibold text-emerald-400/80",
                "transition-all duration-150",
                "hover:border-emerald-500/35 hover:bg-emerald-500/[0.14] hover:text-emerald-400",
                "disabled:cursor-not-allowed disabled:opacity-40",
                "active:scale-[0.98]"
              )}
            >
              {saving ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Save plan
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}