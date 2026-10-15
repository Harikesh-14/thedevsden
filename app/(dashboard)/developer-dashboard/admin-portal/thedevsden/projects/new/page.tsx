"use client"

import { SyntheticEvent, KeyboardEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Blocks,
  Code2,
  Info,
  Layers,
  Save,
  Sparkles,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// ── Quick-pick icon options ────────────────────────────────────────────────
const ICON_PRESETS = ["🟢", "⚡", "🚀", "🧠", "🛠️", "🌐", "📱", "🔒", "🎯", "🔥", "💡", "⚙️"]

// ── Skill tag input ────────────────────────────────────────────────────────
function SkillInput({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) {
  const [input, setInput] = useState("")

  function addSkill(raw: string) {
    const trimmed = raw.trim().replace(/,$/, "").trim()
    if (!trimmed || skills.includes(trimmed)) return
    onChange([...skills, trimmed])
    setInput("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill(input)
    }
    if (e.key === "Backspace" && !input && skills.length) {
      onChange(skills.slice(0, -1))
    }
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill))
  }

  return (
    <div
      onClick={(e) =>
        (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()
      }
      className={cn(
        "flex min-h-[44px] cursor-text flex-wrap gap-1.5 rounded-xl border px-3 py-2",
        "transition-colors duration-150",
        // Light
        "border-neutral-200 bg-neutral-50",
        "focus-within:border-emerald-300 focus-within:bg-emerald-50/30 focus-within:ring-2 focus-within:ring-emerald-500/10",
        // Dark
        "dark:border-white/[0.07] dark:bg-white/[0.04]",
        "dark:focus-within:border-emerald-500/35 dark:focus-within:bg-emerald-500/[0.04] dark:focus-within:ring-0",
      )}
    >
      {skills.map((skill) => (
        <span
          key={skill}
          className={cn(
            "inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[11.5px] font-medium",
            "border-emerald-200/80 bg-emerald-50 text-emerald-700",
            "dark:border-emerald-500/25 dark:bg-emerald-500/[0.1] dark:text-emerald-300/90",
          )}
        >
          {skill}
          <button
            type="button"
            onClick={() => removeSkill(skill)}
            className="ml-0.5 text-emerald-500/60 hover:text-emerald-600 dark:text-emerald-400/50 dark:hover:text-emerald-400"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addSkill(input)}
        placeholder={skills.length ? "Add more…" : "Type a skill and press Enter…"}
        className="min-w-[100px] flex-1 bg-transparent text-[13px] outline-none
          text-neutral-700 placeholder:text-neutral-400
          dark:text-white/65 dark:placeholder:text-white/25"
      />
    </div>
  )
}

// ── Shared field styles ────────────────────────────────────────────────────
const inputClass = cn(
  "h-10 w-full rounded-xl px-4 text-[13px] outline-none transition-all duration-150",
  // Light
  "border border-neutral-200 bg-neutral-50",
  "text-neutral-800 placeholder:text-neutral-400",
  "focus:border-emerald-300 focus:bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500/10",
  // Dark
  "dark:border-white/[0.07] dark:bg-white/[0.04]",
  "dark:text-white/75 dark:placeholder:text-white/25",
  "dark:focus:border-emerald-500/35 dark:focus:bg-emerald-500/[0.04] dark:focus:ring-0",
)

const textareaClass = cn(
  "w-full resize-none rounded-xl px-4 py-3 text-[13px] leading-[1.7] outline-none transition-all duration-150",
  "border border-neutral-200 bg-neutral-50",
  "text-neutral-800 placeholder:text-neutral-400",
  "focus:border-emerald-300 focus:bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500/10",
  "dark:border-white/[0.07] dark:bg-white/[0.04]",
  "dark:text-white/75 dark:placeholder:text-white/25",
  "dark:focus:border-emerald-500/35 dark:focus:bg-emerald-500/[0.04] dark:focus:ring-0",
)

const fieldLabel = cn(
  "mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em]",
  "text-neutral-400 dark:text-white/35",
)

// ── Section card wrapper ───────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className={cn(
      "rounded-[18px] border p-5",
      // Light
      "border-neutral-200 bg-white shadow-sm shadow-neutral-900/[0.04]",
      // Dark
      "dark:border-white/[0.07] dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur-xl",
    )}>
      <div className={cn(
        "mb-5 flex items-center gap-3 pb-4",
        "border-b border-neutral-100 dark:border-white/[0.06]",
      )}>
        <div className={cn(
          "flex size-8 items-center justify-center rounded-xl",
          "border border-emerald-200/80 bg-emerald-50 text-emerald-600",
          "dark:border-emerald-500/20 dark:bg-emerald-500/[0.08] dark:text-emerald-400",
        )}>
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-neutral-800 dark:text-white/80">
            {title}
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-white/30">
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminPortalNewProjectPage() {
  const router = useRouter()

  const [title,       setTitle]       = useState("")
  const [description, setDescription] = useState("")
  const [type,        setType]        = useState("")
  const [skills,      setSkills]      = useState<string[]>([])
  const [href,        setHref]        = useState("")
  const [slug,        setSlug]        = useState("")
  const [icon,        setIcon]        = useState("🟢")
  const [customIcon,  setCustomIcon]  = useState("")
  const [isFeatured,  setIsFeatured]  = useState(false)
  const [saving,      setSaving]      = useState(false)

  // Auto-generate slug from title
  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value))
    }
  }

  function slugify(val: string) {
    return val.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!title.trim())       { toast.error("Title is required");       return }
    if (!description.trim()) { toast.error("Description is required"); return }
    if (!type.trim())        { toast.error("Type is required");        return }
    if (skills.length === 0) { toast.error("Add at least one skill");  return }
    if (!href.trim())        { toast.error("Live URL is required");    return }
    if (!slug.trim())        { toast.error("Slug is required");        return }

    const finalIcon = customIcon.trim() || icon

    setSaving(true)
    try {
      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          title:       title.trim(),
          description: description.trim(),
          type:        type.trim(),
          skills,
          href:        href.trim(),
          icon:        finalIcon,
          slug:        slug.trim().toLowerCase(),
          isFeatured,
        }),
      })

      if (!res.ok) {
        let message = "Failed to create project"
        try {
          const body = await res.json()
          if (typeof body?.message === "string") message = body.message
        } catch {}
        toast.error(message)
        return
      }

      toast.success("Project created")
      router.push("/developer-dashboard/admin-portal/thedevsden/projects")
    } catch {
      toast.error("Something went wrong. Check your connection.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-transparent">

      {/* Glows */}
      <div aria-hidden className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full blur-3xl
        bg-emerald-400/20 dark:bg-emerald-500/[0.09]" />
      <div aria-hidden className="pointer-events-none fixed -bottom-16 right-1/4 h-52 w-72 rounded-full blur-3xl
        bg-emerald-400/15 dark:bg-emerald-500/[0.06]" />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={cn(
              "size-2 rounded-full",
              "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
              "dark:bg-emerald-400 dark:shadow-[0_0_12px_rgba(52,211,153,0.8)]",
            )} />
            {["Admin Portal", "thedevsden", "Projects"].map((crumb) => (
              <span key={crumb} className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
                  text-neutral-400 dark:text-white/35">
                  {crumb}
                </span>
                <span className="text-neutral-200 dark:text-white/15">/</span>
              </span>
            ))}
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
              text-emerald-600/70 dark:text-emerald-500/55">
              New project
            </span>
          </div>

          <div className="mb-5 h-[2px] w-7 rounded-full bg-emerald-500" />

          <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl
            text-neutral-900 dark:text-white/90">
            New project.
            <span className="ml-2 text-neutral-300 dark:text-white/25">Add to portfolio.</span>
          </h1>
          <p className="text-sm leading-6 text-neutral-500 dark:text-white/35">
            Fill in the details below. All fields marked <span className="text-red-400">*</span> are required.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3.5">

          {/* ── Basic info ── */}
          <SectionCard icon={Info} title="Basic info" subtitle="Core details shown on your portfolio">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>
                  Title <span className="text-red-400/80">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Blooplingo"
                  maxLength={80}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={fieldLabel}>
                  Type <span className="text-red-400/80">*</span>
                </label>
                <input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. Web App, CLI Tool, API"
                  maxLength={60}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-3.5">
              <label className={fieldLabel}>
                Description <span className="text-red-400/80">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description shown on the portfolio card…"
                rows={3}
                maxLength={300}
                required
                className={textareaClass}
              />
              <p className="mt-1.5 text-right text-[10px] tabular-nums
                text-neutral-300 dark:text-white/20">
                {description.length} / 300
              </p>
            </div>

            <div className="mt-1 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>
                  Live URL <span className="text-red-400/80">*</span>
                </label>
                <input
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  placeholder="https://blooplingo.com"
                  type="url"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={fieldLabel}>
                  Slug <span className="text-red-400/80">*</span>
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="blooplingo"
                  required
                  className={inputClass}
                />
                <p className="mt-1.5 text-[10.5px] text-neutral-400 dark:text-white/25">
                  Auto-generated from title
                </p>
              </div>
            </div>
          </SectionCard>

          {/* ── Skills ── */}
          <SectionCard icon={Code2} title="Skills" subtitle="Technologies used — press Enter or comma to add">
            <SkillInput skills={skills} onChange={setSkills} />
            {skills.length > 0 && (
              <p className="mt-2 text-[10.5px] text-neutral-400 dark:text-white/25">
                {skills.length} skill{skills.length !== 1 ? "s" : ""} added
              </p>
            )}
          </SectionCard>

          {/* ── Icon ── */}
          <SectionCard icon={Blocks} title="Icon" subtitle="Shown on the project card — pick a preset or type your own">
            <div className="flex flex-wrap items-center gap-2">
              {ICON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setIcon(preset); setCustomIcon("") }}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl border text-xl transition-all duration-100",
                    icon === preset && !customIcon
                      ? [
                          "border-emerald-300 bg-emerald-50 shadow-[0_0_0_2px_rgba(52,211,153,0.2)]",
                          "dark:border-emerald-500/35 dark:bg-emerald-500/[0.12]",
                        ]
                      : [
                          "border-neutral-200 bg-white hover:border-neutral-300",
                          "dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-white/[0.14]",
                        ],
                  )}
                >
                  {preset}
                </button>
              ))}

              {/* Custom input */}
              <input
                value={customIcon}
                onChange={(e) => { setCustomIcon(e.target.value); setIcon("") }}
                placeholder="Custom…"
                maxLength={4}
                className={cn(
                  "h-10 w-24 rounded-xl px-3 text-center text-[16px] outline-none transition-all",
                  "border border-neutral-200 bg-white",
                  "placeholder:text-neutral-400 placeholder:text-[13px]",
                  "focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/10",
                  "dark:border-white/[0.07] dark:bg-white/[0.04]",
                  "dark:text-white/75 dark:placeholder:text-white/25",
                  "dark:focus:border-emerald-500/35 dark:focus:ring-0",
                )}
              />
            </div>
          </SectionCard>

          {/* ── Visibility ── */}
          <SectionCard icon={Sparkles} title="Visibility" subtitle="Control how this project appears on your portfolio">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-neutral-700 dark:text-white/65">
                  Set as featured
                </p>
                <p className="mt-0.5 text-[12px] leading-5 text-neutral-400 dark:text-white/30">
                  Featured projects appear prominently on your portfolio. Max 4 allowed.
                </p>
              </div>
              <Switch
                id="is-featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
                className={cn(
                  "data-[state=checked]:bg-emerald-500",
                  "dark:data-[state=checked]:bg-emerald-400",
                  "dark:bg-neutral-700",
                )}
              />
            </div>
          </SectionCard>

          {/* ── Actions ── */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              href="/developer-dashboard/admin-portal/thedevsden/projects"
              className="flex items-center gap-2 text-[12px] transition-colors
                text-neutral-400 hover:text-neutral-700
                dark:text-white/30 dark:hover:text-white/60"
            >
              <ArrowLeft className="size-3.5" />
              Back to projects
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className={cn(
                  "h-9 rounded-xl border px-4 text-[12.5px] font-medium transition-all",
                  "border-neutral-200 bg-white text-neutral-500",
                  "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700",
                  "dark:border-white/[0.07] dark:bg-transparent dark:text-white/35",
                  "dark:hover:bg-white/[0.05] dark:hover:text-white/60",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !title.trim()}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-xl px-5 text-[12.5px] font-semibold",
                  "transition-all duration-150 active:scale-[0.98]",
                  "border border-emerald-200 bg-emerald-50 text-emerald-700",
                  "hover:border-emerald-300 hover:bg-emerald-100",
                  "dark:border-emerald-500/25 dark:bg-emerald-500/[0.1] dark:text-emerald-300",
                  "dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/[0.16]",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {saving ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2
                      border-emerald-300/30 border-t-emerald-500
                      dark:border-emerald-400/20 dark:border-t-emerald-400" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Save project
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </main>
  )
}