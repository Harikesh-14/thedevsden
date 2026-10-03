"use client";

import { SyntheticEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STACK, type Category } from "@/lib/project-planner";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type MarkdownAction = {
  icon: typeof Bold;
  label: string;
  prefix: string;
  suffix?: string;
  placeholder?: string;
};

const MD_ACTIONS: (MarkdownAction | null)[] = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**" },
  { icon: Italic, label: "Italic", prefix: "_", suffix: "_" },
  { icon: Code, label: "Inline code", prefix: "`", suffix: "`" },
  null,
  { icon: Heading1, label: "Heading 1", prefix: "# ", placeholder: "Heading" },
  { icon: Heading2, label: "Heading 2", prefix: "## ", placeholder: "Heading" },
  null,
  { icon: Minus, label: "Divider", prefix: "\n---\n" },
  { icon: List, label: "Bullet list", prefix: "- ", placeholder: "List item" },
  { icon: ListOrdered, label: "Numbered list", prefix: "1. ", placeholder: "List item" },
  null,
  { icon: Link2, label: "Link", prefix: "[", suffix: "](url)", placeholder: "link text" },
  { icon: Code2, label: "Code block", prefix: "```\n", suffix: "\n```", placeholder: "code" },
];

const CONTENT_PLACEHOLDER = `## Overview\n\nDescribe your project idea, goals, and scope here...\n\n## Features\n\n- Feature one\n- Feature two\n\n## Notes`;

export default function NewProjectPlanPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Partial<Record<Category, Set<string>>>>({});

  function toggleChip(category: Category, value: string) {
    setSelected((prev) => {
      const next = new Set(prev[category] ?? []);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [category]: next };
    });
  }

  function buildSkills(): Record<Category, string[]> {
    return Object.fromEntries(
      (Object.keys(STACK) as Category[]).map((cat) => [
        cat,
        [...(selected[cat] ?? [])],
      ]),
    ) as Record<Category, string[]>;
  }

  function applyMarkdown(action: MarkdownAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);
    const textToWrap = selectedText || action.placeholder || (action.suffix ? "text" : "");
    const inserted = `${action.prefix}${textToWrap}${action.suffix ?? ""}`;
    const nextContent = `${content.slice(0, start)}${inserted}${content.slice(end)}`;

    setContent(nextContent);

    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      const selStart = start + action.prefix.length;
      ta.setSelectionRange(selStart, selStart + textToWrap.length);
    });
  }

  async function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { toast.error("Project title is required"); return; }
    if (saving) return;
    setSaving(true);

    try {
      const response = await apiFetch("/new-projects-plan/", {
        method: "POST",
        body: JSON.stringify({
          title: trimmedTitle,
          shortDescription: shortDescription.trim(),
          isActive: false,
          content,
          skills: buildSkills(),
        }),
      });

      if (!response.ok) {
        let description = "We couldn't save your project plan. Please try again.";
        try {
          const body: unknown = await response.json();
          if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
            description = body.message;
          }
        } catch { /* fallback message */ }
        toast.error("Unable to save project plan", { description, closeButton: true });
        return;
      }

      toast.success("Project plan saved");
      router.push("/developer-dashboard/project-planner");
    } catch (error) {
      console.error("Failed to save project plan:", error);
      toast.error("Unable to save project plan", {
        description: "Check your connection and try again.",
        closeButton: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={cn(
      "relative min-h-screen overflow-hidden",
      "bg-white dark:bg-transparent",
    )}>

      {/* Ambient glows — stronger tint in light mode */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full blur-3xl
          bg-emerald-400/20 dark:bg-emerald-500/9"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-16 right-1/4 h-52 w-72 rounded-full blur-3xl
          bg-emerald-400/15 dark:bg-emerald-500/6"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
                "dark:bg-emerald-400 dark:shadow-[0_0_12px_rgba(52,211,153,0.8)]",
              )}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
              text-neutral-400 dark:text-white/35">
              Project Planner
            </span>
            <span aria-hidden="true" className="text-neutral-200 dark:text-white/15">/</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
              text-emerald-600/70 dark:text-emerald-500/60">
              New plan
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight
            text-neutral-900 dark:text-white/90">
            New project plan.
            <span className="ml-2 text-neutral-300 dark:text-white/25">
              Start from scratch.
            </span>
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-white/35">
            Define the scope, pick your stack, and document the vision.
          </p>
        </header>

        <form onSubmit={handleSave} className="space-y-3.5">

          {/* ── Project details ── */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="project-title"
                className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em]
                  text-neutral-400 dark:text-white/40"
              >
                Project title <span className="text-red-400/80">*</span>
              </label>
              <input
                id="project-title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Blooplingo, DevCLI…"
                autoComplete="off"
                maxLength={120}
                required
                className={cn(
                  "h-10 w-full rounded-xl px-4 outline-none transition-all duration-150",
                  // Light
                  "border border-neutral-200 bg-neutral-50",
                  "text-[13px] text-neutral-800 placeholder:text-neutral-400",
                  "focus:border-emerald-400 focus:bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500/10",
                  // Dark
                  "dark:border-white/[0.07] dark:bg-white/3",
                  "dark:text-white/80 dark:placeholder:text-white/25",
                  "dark:focus:border-emerald-500/40 dark:focus:bg-emerald-500/4 dark:focus:ring-emerald-500/10",
                )}
              />
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em]
                  text-neutral-400 dark:text-white/40"
              >
                Short description
              </label>
              <input
                id="project-description"
                name="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="One line about the project"
                maxLength={240}
                className={cn(
                  "h-10 w-full rounded-xl px-4 outline-none transition-all duration-150",
                  // Light
                  "border border-neutral-200 bg-neutral-50",
                  "text-[13px] text-neutral-800 placeholder:text-neutral-400",
                  "focus:border-emerald-400 focus:bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500/10",
                  // Dark
                  "dark:border-white/[0.07] dark:bg-white/3",
                  "dark:text-white/80 dark:placeholder:text-white/25",
                  "dark:focus:border-emerald-500/40 dark:focus:bg-emerald-500/4 dark:focus:ring-emerald-500/10",
                )}
              />
            </div>
          </div>

          {/* ── Tech stack ── */}
          <section
            aria-labelledby="tech-stack-heading"
            className={cn(
              "rounded-[18px] p-5",
              // Light: white card with border + shadow lifts off bg-white
              "border border-neutral-200 bg-neutral-50/80",
              "shadow-sm shadow-neutral-900/4",
              // Dark
              "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none dark:backdrop-blur-xl",
            )}
          >
            <h2
              id="tech-stack-heading"
              className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest
                text-neutral-500 dark:text-white/45"
            >
              <Code2 aria-hidden="true" className="size-3.5 text-emerald-600/70 dark:text-emerald-500/70" />
              Tech stack
              <span className="text-neutral-300 dark:text-white/25">— select all that apply</span>
            </h2>

            <div className="space-y-5">
              {(Object.entries(STACK) as [Category, (typeof STACK)[Category]][]).map(
                ([category, meta]) => {
                  const values = selected[category] ?? new Set<string>();
                  return (
                    <div key={category}>
                      <div className="mb-2.5 flex items-center gap-2">
                        <span aria-hidden="true" className={cn("size-1.5 rounded-full", meta.color.dot)} />
                        <h3 className="text-[10.5px] font-medium text-neutral-400 dark:text-white/40">
                          {meta.label}
                        </h3>
                        {values.size > 0 && (
                          <span
                            aria-label={`${values.size} selected`}
                            className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-1.5 py-px
                              text-[9px] font-semibold text-emerald-600 dark:text-emerald-400/80"
                          >
                            {values.size}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {meta.options.map((option) => {
                          const isSelected = values.has(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => toggleChip(category, option)}
                              className={cn(
                                "rounded-[7px] border px-2.5 py-1 text-[11px] font-medium",
                                "transition-all duration-100",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                                isSelected
                                  ? meta.color.sel
                                  : cn(
                                    // Light unselected
                                    "border-neutral-200 bg-white text-neutral-500",
                                    "hover:border-neutral-300 hover:text-neutral-700",
                                    // Dark unselected
                                    "dark:border-white/[0.07] dark:bg-white/3 dark:text-white/40",
                                    "dark:hover:border-white/[0.14] dark:hover:text-white/70",
                                  ),
                              )}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          {/* ── Markdown editor ── */}
          <section
            aria-labelledby="markdown-editor-heading"
            className={cn(
              "overflow-hidden rounded-[18px]",
              // Light
              "border border-neutral-200 bg-neutral-50/80",
              "shadow-sm shadow-neutral-900/4",
              // Dark
              "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none dark:backdrop-blur-xl",
            )}
          >
            {/* Toolbar */}
            <div className={cn(
              "flex flex-wrap items-center gap-0.5 px-3 py-2.5",
              "border-b border-neutral-200 dark:border-white/6",
            )}>
              <h2 id="markdown-editor-heading" className="sr-only">
                Project plan content
              </h2>

              {MD_ACTIONS.map((action, index) =>
                action === null ? (
                  <span
                    key={`sep-${index}`}
                    aria-hidden="true"
                    className="mx-1 h-4 w-px bg-neutral-200 dark:bg-white/9"
                  />
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    title={action.label}
                    aria-label={action.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyMarkdown(action)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md transition-colors duration-100",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                      // Light
                      "text-neutral-400 hover:bg-neutral-200/70 hover:text-neutral-700",
                      // Dark
                      "dark:text-white/40 dark:hover:bg-white/[0.07] dark:hover:text-white/80",
                    )}
                  >
                    <action.icon aria-hidden="true" className="size-3.5" />
                  </button>
                ),
              )}
            </div>

            {/* Textarea */}
            <label htmlFor="project-content" className="sr-only">
              Project plan in Markdown
            </label>
            <textarea
              id="project-content"
              name="content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={CONTENT_PLACEHOLDER}
              rows={14}
              className={cn(
                "w-full resize-y bg-transparent px-5 py-4 outline-none",
                "font-mono text-[13px] leading-[1.75]",
                // Light
                "text-neutral-700 placeholder:text-neutral-300",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/15",
                // Dark
                "dark:text-white/75 dark:placeholder:text-white/25",
                "dark:focus-visible:ring-emerald-500/20",
              )}
            />

            {/* Footer */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2.5",
              "border-t border-neutral-200 dark:border-white/6",
            )}>
              <Link2 aria-hidden="true" className="size-3 text-emerald-600/50 dark:text-emerald-500/50" />
              <span className="text-[10.5px] text-neutral-400 dark:text-white/30">
                Markdown supported
              </span>
              {content.length > 0 && (
                <span
                  className="ml-auto text-[10px] tabular-nums text-neutral-300 dark:text-white/25"
                  aria-live="polite"
                >
                  {content.length.toLocaleString()} characters
                </span>
              )}
            </div>
          </section>

          {/* ── Actions ── */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              href="/developer-dashboard/project-planner"
              className={cn(
                "flex items-center gap-2 text-[12px] transition-colors",
                "text-neutral-400 hover:text-neutral-700",
                "dark:text-white/35 dark:hover:text-white/65",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
              )}
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Back to planner
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className={cn(
                  "h-9 rounded-xl px-4 text-[12.5px] font-medium",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  // Light
                  "border border-neutral-200 bg-white text-neutral-500",
                  "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700",
                  // Dark
                  "dark:border-white/[0.07] dark:bg-transparent dark:text-white/40",
                  "dark:hover:bg-white/5 dark:hover:text-white/70",
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !title.trim()}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-xl px-5",
                  "text-[12.5px] font-semibold transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  "active:scale-[0.98]",
                  // Light
                  "border border-emerald-200 bg-emerald-50 text-emerald-700",
                  "hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800",
                  // Dark
                  "dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
                  "dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/16 dark:hover:text-emerald-200",
                )}
              >
                {saving ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-3.5 animate-spin rounded-full border-2
                        border-emerald-400/30 border-t-emerald-500
                        dark:border-emerald-400/20 dark:border-t-emerald-400"
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save aria-hidden="true" className="size-3.5" />
                    Save plan
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
