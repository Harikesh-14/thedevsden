"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Circle,
  Zap,
  Rocket,
  Brain,
  Wrench,
  Globe,
  Smartphone,
  Shield,
  Target,
  Flame,
  Lightbulb,
  Settings,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Project, Filter } from "@/lib/projects"

const MAX_FEATURED = 4

const PROJECT_ICONS = {
  Circle,
  Zap,
  Rocket,
  Brain,
  Wrench,
  Globe,
  Smartphone,
  Shield,
  Target,
  Flame,
  Lightbulb,
  Settings,
}

type ProjectIconName = keyof typeof PROJECT_ICONS

function getProjectIcon(name: string) {
  return PROJECT_ICONS[name as ProjectIconName] ?? Circle
}

// ── Featured slot indicator ────────────────────────────────────────────────
function FeaturedSlots({ count }: { count: number }) {
  const remaining = MAX_FEATURED - count

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-between gap-3 rounded-[14px] border px-4 py-3",
      "border-neutral-200 bg-white/60 shadow-xs",
      "dark:border-white/8 dark:bg-white/2",
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex size-8 items-center justify-center rounded-xl",
          "border border-neutral-200 bg-neutral-50 text-neutral-600",
          "dark:border-white/10 dark:bg-white/5 dark:text-neutral-300",
        )}>
          <Star className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-[12.5px] font-medium text-neutral-600 dark:text-white/60">
          <span className="font-semibold text-neutral-900 dark:text-white">
            {count} of {MAX_FEATURED}
          </span>{" "}
          featured slots used
          {remaining > 0
            ? ` — ${remaining} slot${remaining > 1 ? "s" : ""} available`
            : " — slots full"}
        </p>
      </div>

      {/* Slot pips */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: MAX_FEATURED }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-7 rounded-full transition-colors",
              i < count
                ? "bg-emerald-600 dark:bg-emerald-400"
                : "bg-neutral-200 dark:bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── Project card ───────────────────────────────────────────────────────────
function ProjectCard({
  project,
  featuredCount,
  onToggleFeatured,
  onEdit,
  onDelete,
}: {
  project: Project
  featuredCount: number
  onToggleFeatured: (p: Project) => void
  onEdit: (p: Project) => void
  onDelete: (p: Project) => void
}) {
  const canFeature = project.isFeatured || featuredCount < MAX_FEATURED

  return (
    <article className={cn(
      "group relative flex items-start gap-4 overflow-hidden rounded-[16px] border p-4 sm:p-5",
      "transition-all duration-150",
      "border-neutral-200 bg-white shadow-xs shadow-neutral-900/4",
      "hover:border-neutral-300 hover:shadow-sm",
      "dark:border-white/[0.07] dark:bg-white/2 dark:shadow-none",
      "dark:hover:border-white/15 dark:hover:bg-white/4",
    )}>
      {/* Featured left accent bar */}
      {project.isFeatured && (
        <div className="absolute inset-y-0 left-0 w-1 rounded-l-[16px] bg-emerald-500 dark:bg-emerald-400" />
      )}

      {/* Icon */}
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        "border border-neutral-200 bg-neutral-50 text-neutral-700",
        "dark:border-white/10 dark:bg-white/5 dark:text-neutral-200",
      )}>
        {(() => {
          const Icon = getProjectIcon(project.icon)
          return <Icon className="size-5" />
        })()}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-[14px] font-semibold tracking-[-0.01em]
            text-neutral-900 dark:text-white/90">
            {project.title}
          </h3>

          {project.isFeatured && (
            <span className={cn(
              "rounded-[5px] border px-1.5 py-px text-[9px] font-semibold uppercase tracking-widest",
              "border-emerald-200 bg-emerald-50 text-emerald-700",
              "dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
            )}>
              Featured
            </span>
          )}
        </div>

        <p className="mb-2 text-[11.5px] text-neutral-400 dark:text-white/40">
          {project.type}
        </p>

        <p className="mb-3 line-clamp-2 text-[12px] leading-[1.65]
          text-neutral-600 dark:text-white/50">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.skills.slice(0, 5).map((s) => (
            <span
              key={s}
              className={cn(
                "rounded-[6px] border px-2 py-px text-[10.5px] font-medium",
                "border-neutral-200 bg-neutral-50 text-neutral-600",
                "dark:border-white/[0.07] dark:bg-white/5 dark:text-white/45",
              )}
            >
              {s}
            </span>
          ))}
          {project.skills.length > 5 && (
            <span className={cn(
              "rounded-[6px] border px-2 py-px text-[10.5px] font-medium",
              "border-neutral-200 bg-neutral-50 text-neutral-400",
              "dark:border-white/[0.07] dark:bg-white/5 dark:text-white/30",
            )}>
              +{project.skills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 flex-col gap-1.5">
        {/* Feature toggle */}
        <button
          title={project.isFeatured ? "Remove from featured" : "Set as featured"}
          disabled={!canFeature}
          onClick={() => onToggleFeatured(project)}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
            "disabled:cursor-not-allowed disabled:opacity-30",
            project.isFeatured
              ? [
                "border-emerald-200 bg-emerald-50 text-emerald-600",
                "hover:border-red-200 hover:bg-red-50 hover:text-red-500",
                "dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
                "dark:hover:border-red-500/20 dark:hover:bg-red-500/[0.07] dark:hover:text-red-400",
              ]
              : [
                "border-neutral-200 bg-white text-neutral-400",
                "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700",
                "dark:border-white/[0.07] dark:bg-transparent dark:text-white/30",
                "dark:hover:border-white/15 dark:hover:bg-white/5 dark:hover:text-white/70",
              ],
          )}
        >
          <Star className={cn("size-3.5", project.isFeatured && "fill-current")} />
        </button>

        {/* Edit */}
        <button
          title="Edit project"
          onClick={() => onEdit(project)}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border transition-all duration-150",
            "border-neutral-200 bg-white text-neutral-400",
            "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700",
            "dark:border-white/[0.07] dark:bg-transparent dark:text-white/30",
            "dark:hover:border-white/15 dark:hover:bg-white/5 dark:hover:text-white/70",
          )}
        >
          <Pencil className="size-3.5" />
        </button>

        {/* Delete */}
        <button
          title="Delete project"
          onClick={() => onDelete(project)}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border transition-all duration-150",
            "border-neutral-200 bg-white text-neutral-400",
            "hover:border-red-200 hover:bg-red-50 hover:text-red-500",
            "dark:border-white/[0.07] dark:bg-transparent dark:text-white/30",
            "dark:hover:border-red-500/20 dark:hover:bg-red-500/[0.07] dark:hover:text-red-400",
          )}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </article>
  )
}

// ── Edit dialog ────────────────────────────────────────────────────────────
function EditDialog({
  project,
  open,
  onClose,
  onSaved,
}: {
  project: Project | null
  open: boolean
  onClose: () => void
  onSaved: (updated: Project) => void
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    skills: "",
    href: "",
    icon: "",
    slug: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        description: project.description,
        type: project.type,
        skills: project.skills.join(", "),
        href: project.href,
        icon: project.icon,
        slug: project.slug,
      })
    }
  }, [project])

  async function handleSave() {
    if (!project) return
    setSaving(true)
    try {
      const response = await apiFetch(`/projects/${project._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      })
      if (!response.ok) throw new Error()
      const updated: Project = await response.json()
      toast.success("Project updated")
      onSaved(updated)
      onClose()
    } catch {
      toast.error("Failed to update project")
    } finally {
      setSaving(false)
    }
  }

  const field = (
    id: keyof typeof form,
    label: string,
    placeholder: string,
    multiline = false,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[10.5px] font-semibold uppercase tracking-widest
        text-neutral-400 dark:text-white/40">
        {label}
      </Label>
      {multiline ? (
        <Textarea
          id={id}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          placeholder={placeholder}
          rows={3}
          className={cn(
            "resize-none rounded-xl text-[13px]",
            "border-neutral-200 bg-neutral-50 text-neutral-800 placeholder:text-neutral-400",
            "focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/10",
            "dark:border-white/8 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/30",
          )}
        />
      ) : (
        <Input
          id={id}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          placeholder={placeholder}
          className={cn(
            "h-9 rounded-xl text-[13px]",
            "border-neutral-200 bg-neutral-50 text-neutral-800 placeholder:text-neutral-400",
            "focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/10",
            "dark:border-white/8 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/30",
          )}
        />
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn(
        "max-w-lg rounded-[20px] p-6",
        "border-neutral-200 bg-white dark:border-white/10 dark:bg-[#111]",
      )}>
        <DialogHeader className="mb-1">
          <DialogTitle className="text-[15px] font-semibold
            text-neutral-900 dark:text-white">
            Edit project
          </DialogTitle>
          <DialogDescription className="text-[12.5px]
            text-neutral-500 dark:text-white/40">
            Update the details for{" "}
            <span className="font-medium text-neutral-700 dark:text-white/70">
              {project?.title}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3.5">
          {field("title", "Title", "Project title")}
          {field("description", "Description", "Short description", true)}
          <div className="grid grid-cols-2 gap-3">
            {field("type", "Type", "e.g. Web App, CLI Tool")}
            <div className="space-y-1.5">
              <Label
                htmlFor="icon"
                className="text-[10.5px] font-semibold uppercase tracking-widest
                text-neutral-400 dark:text-white/40"
              >
                Icon
              </Label>

              <select
                id="icon"
                value={form.icon}
                onChange={(e) =>
                  setForm((f) => ({ ...f, icon: e.target.value }))
                }
                className={cn(
                  "h-9 w-full rounded-xl border px-3 text-[13px] outline-none",
                  "border-neutral-200 bg-neutral-50 text-neutral-800",
                  "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10",
                  "dark:border-white/8 dark:bg-neutral-900 dark:text-white/80",
                )}
              >
                {Object.keys(PROJECT_ICONS).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {field("skills", "Skills", "Next.js, TypeScript, Node.js…")}
          <div className="grid grid-cols-2 gap-3">
            {field("href", "Live URL", "https://…")}
            {field("slug", "Slug", "my-project")}
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <button
            onClick={onClose}
            className={cn(
              "h-9 rounded-xl border px-4 text-[12.5px] font-medium transition-colors",
              "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
              "dark:border-white/8 dark:bg-transparent dark:text-white/50 dark:hover:bg-white/5",
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex h-9 items-center gap-2 rounded-xl px-5 text-[12.5px] font-semibold transition-all",
              "bg-neutral-900 text-white hover:bg-neutral-800",
              "dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {saving && (
              <span className="size-3.5 animate-spin rounded-full border-2
                border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900" />
            )}
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminPortalProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const featuredCount = projects.filter((p) => p.isFeatured).length

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.skills.some((s) => s.toLowerCase().includes(q))
    const matchFilter = filter === "all" || p.isFeatured
    return matchSearch && matchFilter
  })

  const stats = [
    { label: "Total", value: String(projects.length), accent: false },
    { label: "Featured", value: `${featuredCount} / ${MAX_FEATURED}`, accent: true },
    { label: "Types", value: String(new Set(projects.map((p) => p.type)).size), accent: false },
    { label: "Skills used", value: String(new Set(projects.flatMap((p) => p.skills)).size), accent: false },
  ]

  // ── API ──────────────────────────────────────────────────────────────────
  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await apiFetch("/projects")
      if (!res.ok) throw new Error()
      setProjects(await res.json())
    } catch {
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  async function toggleFeatured(project: Project) {
    const willFeature = !project.isFeatured
    if (willFeature && featuredCount >= MAX_FEATURED) {
      toast.error("Featured slots full", {
        description: `Remove a featured project before adding another.`,
      })
      return
    }

    try {
      const res = await apiFetch(`/projects/${project._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isFeatured: willFeature }),
      })
      if (!res.ok) throw new Error()
      const updated: Project = await res.json()
      setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
      toast.success(
        willFeature ? "Added to featured" : "Removed from featured",
      )
    } catch {
      toast.error("Failed to update project")
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiFetch(`/projects/${deleteTarget._id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id))
      toast.success("Project deleted")
      setDeleteTarget(null)
    } catch {
      toast.error("Failed to delete project")
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-neutral-950">

      {/* Subtle Glows */}
      <div aria-hidden className="pointer-events-none fixed -top-24 left-1/4 h-72 w-96 rounded-full blur-[120px]
        bg-emerald-500/5 dark:bg-emerald-500/10" />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className={cn(
              "size-2 rounded-full",
              "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
            )} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
              text-neutral-400 dark:text-white/40">
              Admin Portal
            </span>
            <span className="text-neutral-200 dark:text-white/20">/</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
              text-neutral-400 dark:text-white/40">
              thedevsden
            </span>
            <span className="text-neutral-200 dark:text-white/20">/</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
              text-neutral-700 dark:text-white/80">
              Projects
            </span>
          </div>

          <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl
            text-neutral-900 dark:text-white">
            Projects.
            <span className="ml-2 text-neutral-400 dark:text-white/40">Manage all.</span>
          </h1>
          <p className="max-w-md text-sm leading-6 text-neutral-500 dark:text-white/50">
            Add, update, delete and feature projects shown on your portfolio.
          </p>
        </header>

        {/* ── Stats ── */}
        <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, accent }) => (
            <div key={label} className={cn(
              "rounded-[16px] border p-4",
              "border-neutral-200 bg-white shadow-xs shadow-neutral-900/4",
              "dark:border-white/[0.07] dark:bg-white/2 dark:shadow-none",
            )}>
              <p className="text-[11px] font-medium text-neutral-400 dark:text-white/40">
                {label}
              </p>
              <p className={cn(
                "mt-1 text-[24px] font-semibold tracking-[-0.03em]",
                accent ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-900 dark:text-white",
              )}>
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* ── Featured slot indicator ── */}
        <div className="mb-4">
          <FeaturedSlots count={featuredCount} />
        </div>

        {/* ── Toolbar ── */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-45 flex-1">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2
              text-neutral-400 dark:text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, type or skill…"
              className={cn(
                "h-9 w-full rounded-xl pl-9 pr-4 text-[12.5px] outline-none transition-all",
                "border border-neutral-200 bg-white shadow-xs shadow-neutral-900/4",
                "text-neutral-800 placeholder:text-neutral-400",
                "focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10",
                "dark:border-white/[0.07] dark:bg-white/2 dark:shadow-none",
                "dark:text-white/80 dark:placeholder:text-white/30",
                "dark:focus:border-white/20 dark:focus:ring-0",
              )}
            />
          </div>

          {/* Filters */}
          {(["all", "featured"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex h-9 items-center gap-2 rounded-xl px-3.5 text-[12px] font-medium transition-all",
                filter === f
                  ? "border border-neutral-300 bg-neutral-900 text-white dark:border-white/20 dark:bg-white dark:text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-white/[0.07] dark:bg-white/2 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white",
              )}
            >
              {f === "featured" && <Star className="size-3 fill-current text-emerald-500" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          {/* Add */}
          <button
            onClick={() => router.push("/developer-dashboard/admin-portal/thedevsden/projects/new")}
            className={cn(
              "group flex h-9 items-center gap-2 rounded-xl px-4 text-[12.5px] font-semibold",
              "transition-all duration-150 active:scale-[0.98]",
              "border border-emerald-500/30 bg-emerald-50 text-emerald-700",
              "hover:border-emerald-500 hover:bg-emerald-100",
              "dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
              "dark:hover:bg-emerald-500/20",
            )}
          >
            <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
            Add project
          </button>
        </div>

        {/* ── Project list ── */}
        <div className="mb-4 flex items-center gap-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em]
            text-neutral-400 dark:text-white/40 whitespace-nowrap">
            {filter === "featured" ? "Featured projects" : "All projects"}
          </p>
          <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
          <p className="text-[10px] text-neutral-400 dark:text-white/30 whitespace-nowrap">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn(
                "h-27.5 animate-pulse rounded-[16px] border",
                "border-neutral-200 bg-neutral-50",
                "dark:border-white/[0.07] dark:bg-white/2",
              )} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <p className="text-sm font-medium text-neutral-400 dark:text-white/30">
              {search ? "No projects match your search" : "No projects yet"}
            </p>
            <p className="text-xs text-neutral-300 dark:text-white/20">
              {search ? "Try a different keyword" : "Add your first project to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                featuredCount={featuredCount}
                onToggleFeatured={toggleFeatured}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Edit dialog ── */}
      <EditDialog
        project={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={(updated) =>
          setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
        }
      />

      {/* ── Delete confirmation ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent className={cn(
          "max-w-sm rounded-[20px]",
          "border-neutral-200 bg-white dark:border-white/10 dark:bg-[#111]",
        )}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px] font-semibold
              text-neutral-900 dark:text-white">
              Delete project?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[12.5px]
              text-neutral-500 dark:text-white/50">
              <span className="font-semibold text-neutral-700 dark:text-white/80">
                {deleteTarget?.title}
              </span>{" "}
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-2">
            <AlertDialogCancel className={cn(
              "h-9 rounded-xl border text-[12.5px] font-medium",
              "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
              "dark:border-white/8 dark:bg-transparent dark:text-white/50",
            )}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className={cn(
                "flex h-9 items-center gap-2 rounded-xl px-4 text-[12.5px] font-semibold",
                "border border-red-200 bg-red-50 text-red-600",
                "hover:border-red-300 hover:bg-red-100",
                "dark:border-red-500/20 dark:bg-red-500/[0.07] dark:text-red-400",
                "dark:hover:bg-red-500/12",
                "disabled:opacity-40",
              )}
            >
              {deleting && (
                <span className="size-3.5 animate-spin rounded-full border-2
                  border-red-300/30 border-t-red-500" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}