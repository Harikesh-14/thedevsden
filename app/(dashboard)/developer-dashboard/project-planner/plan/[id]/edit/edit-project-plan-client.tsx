"use client";

import {
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { STACK, type Category } from "@/lib/project-planner";

type ProjectPlan = {
  _id?: string;
  id?: string;
  title: string;
  shortDescription?: string;
  content?: string;
  isActive?: boolean;
  skills?: Partial<Record<Category, string[]>>;
};

type MarkdownAction = {
  icon: typeof Bold;
  label: string;
  prefix: string;
  suffix?: string;
  placeholder?: string;
};

const MD_ACTIONS: (MarkdownAction | null)[] = [
  {
    icon: Bold,
    label: "Bold",
    prefix: "**",
    suffix: "**",
  },
  {
    icon: Italic,
    label: "Italic",
    prefix: "*",
    suffix: "*",
  },
  {
    icon: Code,
    label: "Inline code",
    prefix: "`",
    suffix: "`",
  },
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
  {
    icon: Minus,
    label: "Divider",
    prefix: "\n---\n",
  },
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

function getMessage(body: unknown, fallback: string) {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return fallback;
}

export default function EditProjectPlanClient({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");

  const [selected, setSelected] = useState<
    Partial<Record<Category, Set<string>>>
  >({});

  const [originalIsActive, setOriginalIsActive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPlan() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await apiFetch(
          `/new-projects-plan/get/${encodeURIComponent(id)}/`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This project plan could not be found."
              : "Unable to load this project plan.",
          );
        }

        const body: unknown = await response.json();

        // Supports either:
        // { ...plan }
        // or:
        // { data: { ...plan } }
        const payload =
          typeof body === "object" &&
            body !== null &&
            "data" in body
            ? body.data
            : body;

        if (
          typeof payload !== "object" ||
          payload === null ||
          !("title" in payload) ||
          typeof payload.title !== "string"
        ) {
          throw new Error(
            "The server returned an invalid project plan.",
          );
        }

        const plan = payload as ProjectPlan;

        if (cancelled) return;

        setTitle(plan.title);
        setShortDescription(plan.shortDescription ?? "");
        setContent(plan.content ?? "");
        setOriginalIsActive(plan.isActive ?? false);

        const nextSelected: Partial<
          Record<Category, Set<string>>
        > = {};

        for (const category of Object.keys(STACK) as Category[]) {
          nextSelected[category] = new Set(
            Array.isArray(plan.skills?.[category])
              ? plan.skills[category]
              : [],
          );
        }

        setSelected(nextSelected);
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the plan.";

        setLoadError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPlan();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function toggleChip(category: Category, value: string) {
    setSelected((previous) => {
      const next = new Set(previous[category] ?? []);

      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }

      return {
        ...previous,
        [category]: next,
      };
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
      selectedText ||
      action.placeholder ||
      (action.suffix ? "text" : "");

    const inserted = `${action.prefix}${textToWrap}${action.suffix ?? ""
      }`;

    const nextContent =
      content.slice(0, start) +
      inserted +
      content.slice(end);

    setContent(nextContent);

    requestAnimationFrame(() => {
      const current = textareaRef.current;

      if (!current) return;

      current.focus();

      const selectionStart =
        start + action.prefix.length;

      current.setSelectionRange(
        selectionStart,
        selectionStart + textToWrap.length,
      );
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
      const response = await apiFetch(
        `/new-projects-plan/${encodeURIComponent(id)}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: trimmedTitle,
            shortDescription: shortDescription.trim(),
            content,
            skills: buildSkills(),
            isActive: originalIsActive,
          }),
        },
      );

      if (!response.ok) {
        let message =
          "We couldn't update your project plan. Please try again.";

        try {
          message = getMessage(
            await response.json(),
            message,
          );
        } catch {
          // Keep the fallback message.
        }

        toast.error("Unable to update project plan", {
          description: message,
          closeButton: true,
        });

        return;
      }

      toast.success("Project plan updated");

      router.push(
        `/developer-dashboard/project-planner/${encodeURIComponent(id)}`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Failed to update project plan:",
        error,
      );

      toast.error("Unable to update project plan", {
        description:
          "Check your connection and try again.",
        closeButton: true,
      });
    } finally {
      setSaving(false);
    }
  }

  const inputClass = cn(
    "h-10 w-full rounded-xl px-4 outline-none transition-all duration-150",
    "border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-800",
    "placeholder:text-neutral-400 focus:border-emerald-400",
    "focus:bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500/10",
    "dark:border-white/[0.07] dark:bg-white/3",
    "dark:text-white/80 dark:placeholder:text-white/25",
    "dark:focus:border-emerald-500/40 dark:focus:bg-emerald-500/[0.04]",
  );

  const cardClass = cn(
    "rounded-[18px] border border-neutral-200 bg-neutral-50/80",
    "shadow-sm shadow-neutral-900/[0.04]",
    "dark:border-white/[0.07] dark:bg-white/3",
    "dark:shadow-none dark:backdrop-blur-xl",
  );

  if (loading) {
    return (
      <main className="relative min-h-[60vh]">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-5">
            <div className="space-y-3">
              <div className="h-3 w-32 rounded bg-neutral-200 dark:bg-white/10" />
              <div className="h-9 w-72 rounded-lg bg-neutral-200 dark:bg-white/10" />
              <div className="h-4 w-96 max-w-full rounded bg-neutral-200 dark:bg-white/10" />
            </div>

            <div className="h-10 rounded-xl bg-neutral-200 dark:bg-white/10" />

            <div className="h-56 rounded-[18px] bg-neutral-200 dark:bg-white/10" />

            <div className="h-105 rounded-[18px] bg-neutral-200 dark:bg-white/10" />
          </div>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="relative min-h-[60vh]">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            !
          </div>

          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white/90">
            Couldn't load this project plan
          </h1>

          <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-white/40">
            {loadError}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
            >
              Try again
            </button>

            <Link
              href="/developer-dashboard/project-planner"
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90"
            >
              Back to planner
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[60vh] overflow-hidden">
      {/* Ambient emerald glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/6 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:bg-emerald-400" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-white/35">
              Project Planner
            </span>

            <span className="text-neutral-200 dark:text-white/15">
              /
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600/70 dark:text-emerald-500/60">
              Edit plan
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white/90">
            Edit project plan.
            <span className="ml-2 text-neutral-300 dark:text-white/25">
              Make it better.
            </span>
          </h1>

          <p className="mt-2 text-sm text-neutral-500 dark:text-white/35">
            Update your project vision, refine the stack,
            and keep everything in sync.
          </p>
        </header>

        <form
          onSubmit={handleSave}
          className="space-y-3.5"
        >
          {/* Project details */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="project-title"
                className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-neutral-400 dark:text-white/40"
              >
                Project title{" "}
                <span className="text-red-400/80">
                  *
                </span>
              </label>

              <input
                id="project-title"
                name="title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={120}
                required
                autoComplete="off"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-neutral-400 dark:text-white/40"
              >
                Short description
              </label>

              <input
                id="project-description"
                name="shortDescription"
                value={shortDescription}
                onChange={(event) =>
                  setShortDescription(
                    event.target.value,
                  )
                }
                maxLength={240}
                placeholder="One line about the project"
                className={inputClass}
              />
            </div>
          </div>

          {/* Tech stack */}
          <section
            aria-labelledby="tech-stack-heading"
            className={cn(cardClass, "p-5")}
          >
            <h2
              id="tech-stack-heading"
              className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-white/45"
            >
              <Code2 className="size-3.5 text-emerald-600/70 dark:text-emerald-500/70" />

              Tech stack

              <span className="text-neutral-300 dark:text-white/25">
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
                  selected[category] ??
                  new Set<string>();

                return (
                  <div key={category}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          meta.color.dot,
                        )}
                      />

                      <h3 className="text-[10.5px] font-medium text-neutral-400 dark:text-white/40">
                        {meta.label}
                      </h3>

                      {values.size > 0 && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-1.5 py-px text-[9px] font-semibold text-emerald-600 dark:text-emerald-400/80">
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
                            aria-pressed={isSelected}
                            onClick={() =>
                              toggleChip(
                                category,
                                option,
                              )
                            }
                            className={cn(
                              "rounded-[7px] border px-2.5 py-1 text-[11px] font-medium transition-all duration-100",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                              isSelected
                                ? meta.color.sel
                                : cn(
                                  "border-neutral-200 bg-white text-neutral-500",
                                  "hover:border-neutral-300 hover:text-neutral-700",
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
              })}
            </div>
          </section>

          {/* Markdown editor */}
          <section
            aria-labelledby="markdown-editor-heading"
            className={cn(
              cardClass,
              "overflow-hidden",
            )}
          >
            <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 px-3 py-2.5 dark:border-white/6">
              <h2
                id="markdown-editor-heading"
                className="sr-only"
              >
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
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={() =>
                      applyMarkdown(action)
                    }
                    className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:text-white/40 dark:hover:bg-white/[0.07] dark:hover:text-white/80"
                  >
                    <action.icon
                      className="size-3.5"
                      aria-hidden="true"
                    />
                  </button>
                ),
              )}
            </div>

            <label
              htmlFor="project-content"
              className="sr-only"
            >
              Project plan in Markdown
            </label>

            <textarea
              id="project-content"
              name="content"
              ref={textareaRef}
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder={
                "## Overview\n\nDescribe your project idea, goals, and scope..."
              }
              rows={14}
              className={cn(
                "w-full resize-y bg-transparent px-5 py-4 font-mono text-[13px] leading-[1.75] outline-none",
                "text-neutral-700 placeholder:text-neutral-300",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/15",
                "dark:text-white/75 dark:placeholder:text-white/25 dark:focus-visible:ring-emerald-500/20",
              )}
            />

            <div className="flex items-center gap-2 border-t border-neutral-200 px-4 py-2.5 dark:border-white/6">
              <Link2 className="size-3 text-emerald-600/50 dark:text-emerald-500/50" />

              <span className="text-[10.5px] text-neutral-400 dark:text-white/30">
                Markdown supported
              </span>

              <span className="ml-auto text-[10px] tabular-nums text-neutral-300 dark:text-white/25">
                {content.length.toLocaleString()}{" "}
                characters
              </span>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              href={`/developer-dashboard/project-planner/${encodeURIComponent(id)}`}
              className="flex items-center gap-2 text-[12px] text-neutral-400 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:text-white/35 dark:hover:text-white/65"
            >
              <ArrowLeft className="size-3.5" />
              Back to plan
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="h-9 rounded-xl border border-neutral-200 bg-white px-4 text-[12.5px] font-medium text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-40 dark:border-white/[0.07] dark:bg-transparent dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white/70"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-[12.5px] font-semibold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/16"
              >
                {saving ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-500 dark:border-emerald-400/20 dark:border-t-emerald-400" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Save changes
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