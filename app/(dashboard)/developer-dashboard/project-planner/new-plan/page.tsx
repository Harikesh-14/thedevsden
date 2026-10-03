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
  {
    icon: Heading1,
    label: "Heading 1",
    prefix: "# ",
    placeholder: "Heading",
  },
  {
    icon: Heading2,
    label: "Heading 2",
    prefix: "## ",
    placeholder: "Heading",
  },
  null,
  { icon: Minus, label: "Divider", prefix: "\n---\n" },
  {
    icon: List,
    label: "Bullet list",
    prefix: "- ",
    placeholder: "List item",
  },
  {
    icon: ListOrdered,
    label: "Numbered list",
    prefix: "1. ",
    placeholder: "List item",
  },
  null,
  {
    icon: Link2,
    label: "Link",
    prefix: "[",
    suffix: "](url)",
    placeholder: "link text",
  },
  {
    icon: Code2,
    label: "Code block",
    prefix: "```\n",
    suffix: "\n```",
    placeholder: "code",
  },
];

const CONTENT_PLACEHOLDER = `## Overview\n\nDescribe your project idea, goals, and scope here...\n\n## Features\n\n- Feature one\n- Feature two\n\n## Notes`;

export default function NewProjectPlanPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<
    Partial<Record<Category, Set<string>>>
  >({});

  function toggleChip(category: Category, value: string) {
    setSelected((previous) => {
      const nextValues = new Set(previous[category] ?? []);
      if (nextValues.has(value)) nextValues.delete(value);
      else nextValues.add(value);

      return { ...previous, [category]: nextValues };
    });
  }

  function buildSkills(): Record<Category, string[]> {
    return Object.fromEntries(
      (Object.keys(STACK) as Category[]).map((category) => [
        category,
        [...(selected[category] ?? [])],
      ]),
    ) as Record<Category, string[]>;
  }

  function applyMarkdown(action: MarkdownAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);
    const textToWrap =
      selectedText || action.placeholder || (action.suffix ? "text" : "");
    const before = content.slice(0, start);
    const after = content.slice(end);
    const inserted = `${action.prefix}${textToWrap}${action.suffix ?? ""}`;
    const nextContent = `${before}${inserted}${after}`;

    setContent(nextContent);

    // Restore focus and selection after React applies the controlled value.
    requestAnimationFrame(() => {
      const currentTextarea = textareaRef.current;
      if (!currentTextarea) return;

      currentTextarea.focus();
      const selectionStart = start + action.prefix.length;
      const selectionEnd = selectionStart + textToWrap.length;
      currentTextarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  async function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Project title is required");
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      const response = await apiFetch("/new-projects-plan/", {
        method: "POST",
        body: JSON.stringify({
          title: trimmedTitle,
          shortDescription: shortDescription.trim(),
          content,
          skills: buildSkills(),
        }),
      });

      if (!response.ok) {
        // Keep the UI message useful without exposing server internals to users.
        let description =
          "We couldn't save your project plan. Please try again.";
        try {
          const errorBody: unknown = await response.json();
          if (
            typeof errorBody === "object" &&
            errorBody !== null &&
            "message" in errorBody &&
            typeof errorBody.message === "string"
          ) {
            description = errorBody.message;
          }
        } catch {
          // The response may not contain JSON; use the fallback message.
        }
        toast.error("Unable to save project plan", {
          description,
          closeButton: true,
        });
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
    <main className="relative min-h-screen overflow-hidden">
      {/* Decorative background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full bg-emerald-500/9 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-16 right-1/4 h-52 w-72 rounded-full bg-emerald-500/6 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Project Planner
            </span>
            <span aria-hidden="true" className="text-white/15">
              /
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-500/60">
              New plan
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            New project plan.
            <span className="ml-2 text-white/25">
              Start from scratch.
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/35">
            Define the scope, pick your stack, and document the
            vision.
          </p>
        </header>

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Project details */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="project-title"
                className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/40"
              >
                Project title{" "}
                <span className="text-red-400/80">*</span>
              </label>
              <input
                id="project-title"
                name="title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Blooplingo, DevCLI…"
                autoComplete="off"
                maxLength={120}
                required
                className={cn(
                  "h-10 w-full rounded-xl px-4",
                  "border border-white/[0.07] bg-white/3",
                  "text-[13px] text-white/80 placeholder:text-white/25",
                  "outline-none backdrop-blur-xl",
                  "focus:border-emerald-500/40 focus:bg-emerald-500/4 focus:ring-2 focus:ring-emerald-500/10",
                  "transition-colors duration-150",
                )}
              />
            </div>
            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/40"
              >
                Short description
              </label>
              <input
                id="project-description"
                name="shortDescription"
                value={shortDescription}
                onChange={(event) =>
                  setShortDescription(event.target.value)
                }
                placeholder="One line about the project"
                maxLength={240}
                className={cn(
                  "h-10 w-full rounded-xl px-4",
                  "border border-white/[0.07] bg-white/3",
                  "text-[13px] text-white/80 placeholder:text-white/25",
                  "outline-none backdrop-blur-xl",
                  "focus:border-emerald-500/40 focus:bg-emerald-500/4 focus:ring-2 focus:ring-emerald-500/10",
                  "transition-colors duration-150",
                )}
              />
            </div>
          </div>

          {/* Tech stack */}
          <section
            aria-labelledby="tech-stack-heading"
            className={cn(
              "rounded-[18px] border border-white/[0.07] bg-white/3",
              "p-5 backdrop-blur-xl",
            )}
          >
            <h2
              id="tech-stack-heading"
              className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/45"
            >
              <Code2
                aria-hidden="true"
                className="size-3.5 text-emerald-500/70"
              />
              Tech stack
              <span className="text-white/25">
                — select all that apply
              </span>
            </h2>

            <div className="space-y-5">
              {(
                Object.entries(STACK) as [
                  Category,
                  (typeof STACK)[Category],
                ][]
              ).map(([category, meta]) => {
                const values =
                  selected[category] ?? new Set<string>();
                return (
                  <div key={category}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full",
                          meta.color.dot,
                        )}
                      />
                      <h3 className="text-[10.5px] font-medium text-white/40">
                        {meta.label}
                      </h3>
                      {values.size > 0 && (
                        <span
                          aria-label={`${values.size} selected`}
                          className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-1.5 py-px text-[9px] font-semibold text-emerald-400/80"
                        >
                          {values.size}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.options.map((option) => {
                        const isSelected =
                          values.has(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={
                              isSelected
                            }
                            onClick={() =>
                              toggleChip(
                                category,
                                option,
                              )
                            }
                            className={cn(
                              "rounded-[7px] border px-2.5 py-1 text-[11px] font-medium",
                              "transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                              isSelected
                                ? meta.color.sel
                                : "border-white/[0.07] bg-white/3 text-white/40 hover:border-white/[0.14] hover:text-white/70",
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Markdown editor */}
          <section
            aria-labelledby="markdown-editor-heading"
            className={cn(
              "overflow-hidden rounded-[18px]",
              "border border-white/[0.07] bg-white/3 backdrop-blur-xl",
            )}
          >
            <div className="flex flex-wrap items-center gap-0.5 border-b border-white/6 px-3 py-2.5">
              <h2
                id="markdown-editor-heading"
                className="sr-only"
              >
                Project plan content
              </h2>
              {MD_ACTIONS.map((action, index) =>
                action === null ? (
                  <span
                    key={`separator-${index}`}
                    aria-hidden="true"
                    className="mx-1 h-4 w-px bg-white/9"
                  />
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    title={action.label}
                    aria-label={action.label}
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={() => applyMarkdown(action)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md",
                      "text-white/40 transition-colors duration-100",
                      "hover:bg-white/[0.07] hover:text-white/80",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                    )}
                  >
                    <action.icon
                      aria-hidden="true"
                      className="size-3.5"
                    />
                  </button>
                ),
              )}
            </div>

            <label htmlFor="project-content" className="sr-only">
              Project plan in Markdown
            </label>
            <textarea
              id="project-content"
              name="content"
              ref={textareaRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={CONTENT_PLACEHOLDER}
              rows={14}
              className={cn(
                "w-full resize-y bg-transparent px-5 py-4",
                "font-mono text-[13px] leading-[1.75] text-white/75",
                "placeholder:text-white/25 outline-none",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/20",
              )}
            />

            <div className="flex items-center gap-2 border-t border-white/6 px-4 py-2.5">
              <Link2
                aria-hidden="true"
                className="size-3 text-emerald-500/50"
              />
              <span className="text-[10.5px] text-white/30">
                Markdown supported
              </span>
              <span
                className="ml-auto text-[10px] tabular-nums text-white/25"
                aria-live="polite"
              >
                {content.length.toLocaleString()} characters
              </span>
            </div>
          </section>

          {/* Form actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              href="/developer-dashboard/project-planner"
              className="flex items-center gap-2 text-[12px] text-white/35 transition-colors hover:text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
            >
              <ArrowLeft
                aria-hidden="true"
                className="size-3.5"
              />
              Back to planner
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className={cn(
                  "h-9 rounded-xl border border-white/[0.07] bg-transparent px-4",
                  "text-[12.5px] font-medium text-white/40",
                  "transition-all duration-150 hover:bg-white/5 hover:text-white/70",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !title.trim()}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-xl px-5",
                  "border border-emerald-500/25 bg-emerald-500/10",
                  "text-[12.5px] font-semibold text-emerald-300",
                  "transition-all duration-150",
                  "hover:border-emerald-500/40 hover:bg-emerald-500/16 hover:text-emerald-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  "active:scale-[0.98]",
                )}
              >
                {saving ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-3.5 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400"
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save
                      aria-hidden="true"
                      className="size-3.5"
                    />
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
