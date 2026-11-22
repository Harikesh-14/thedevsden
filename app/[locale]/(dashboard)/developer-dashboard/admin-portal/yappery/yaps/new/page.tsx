"use client";

import { FormEvent, KeyboardEvent, SyntheticEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Image,
  Info,
  Link2,
  Eye,
  PenLine,
  Save,
  Send,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = {
  _id: string;
  name: string;
  slug?: string;
};

// ─── Shared styles ──────────────────────────────────────────────────────────

const inputClass = cn(
  "h-10 w-full rounded-xl px-4 text-[13px] outline-none transition-all duration-150",
  "border border-neutral-200 bg-neutral-50",
  "text-neutral-800 placeholder:text-neutral-400",
  "focus:border-emerald-300 focus:bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500/10",
  "dark:border-white/[0.07] dark:bg-white/4",
  "dark:text-white/75 dark:placeholder:text-white/25",
  "dark:focus:border-emerald-500/35 dark:focus:bg-emerald-500/4 dark:focus:ring-0",
);

const textareaClass = cn(
  "w-full resize-none rounded-xl px-4 py-3 text-[13px] leading-[1.7] outline-none transition-all duration-150",
  "border border-neutral-200 bg-neutral-50",
  "text-neutral-800 placeholder:text-neutral-400",
  "focus:border-emerald-300 focus:bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500/10",
  "dark:border-white/[0.07] dark:bg-white/4",
  "dark:text-white/75 dark:placeholder:text-white/25",
  "dark:focus:border-emerald-500/35 dark:focus:bg-emerald-500/4 dark:focus:ring-0",
);

const fieldLabel = cn(
  "mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.12em]",
  "text-neutral-400 dark:text-white/35",
);

// ─── Section Card ───────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border p-5",
        "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
        "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none dark:backdrop-blur-xl",
      )}
    >
      <div
        className={cn(
          "mb-5 flex items-center gap-3 border-b pb-4",
          "border-neutral-100 dark:border-white/6",
        )}
      >
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-xl",
            "border border-emerald-200/80 bg-emerald-50 text-emerald-600",
            "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-400",
          )}
        >
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
  );
}

// ─── Tag Input ──────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const value = raw.trim().replace(/,$/, "").trim();

    if (!value) return;

    if (tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setInput("");
      return;
    }

    onChange([...tags, value]);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }

    if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div
      onClick={(e) =>
        (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()
      }
      className={cn(
        "flex min-h-11 cursor-text flex-wrap gap-1.5 rounded-xl border px-3 py-2",
        "transition-colors duration-150",
        "border-neutral-200 bg-neutral-50",
        "focus-within:border-emerald-300 focus-within:bg-emerald-50/30 focus-within:ring-2 focus-within:ring-emerald-500/10",
        "dark:border-white/[0.07] dark:bg-white/4",
        "dark:focus-within:border-emerald-500/35 dark:focus-within:bg-emerald-500/4 dark:focus-within:ring-0",
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[11.5px] font-medium",
            "border-emerald-200/80 bg-emerald-50 text-emerald-700",
            "dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300/90",
          )}
        >
          {tag}

          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
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
        onBlur={() => addTag(input)}
        placeholder={tags.length ? "Add more..." : "Type a tag and press Enter..."}
        className="min-w-25 flex-1 bg-transparent text-[13px] text-neutral-700 outline-none placeholder:text-neutral-400 dark:text-white/65 dark:placeholder:text-white/25"
      />
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AdminPortalNewYapPage() {
  const router = useRouter();

  // Form fields
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Editor
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");

  // UI
  const [saving, setSaving] = useState(false);

  // ─── Fetch Categories ─────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiFetch("/yappery/categories");

        if (!res.ok) throw new Error();

        const result = await res.json();

        // Supports either an array or a { data: [] } response.
        setCategories(Array.isArray(result) ? result : result.data || []);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  // ─── Submit Yap ──────────────────────────────────────────────────────────

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Yap title is required");
      return;
    }

    if (!content.trim()) {
      toast.error("Yap content cannot be empty");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (excerpt.length > 300) {
      toast.error("Excerpt cannot exceed 300 characters");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        category,
        tags,
        isPublished,
        coverImage: coverImage.trim() || undefined,
      };

      const res = await apiFetch("/blogs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to create yap";

        try {
          const body = await res.json();

          if (Array.isArray(body?.message)) {
            message = body.message.join(", ");
          } else if (typeof body?.message === "string") {
            message = body.message;
          }
        } catch {
          // Use default error message.
        }

        toast.error(message);
        return;
      }

      toast.success(
        isPublished ? "Your yap is now published!" : "Yap saved as draft!",
      );

      router.push("/developer-dashboard/admin-portal/yappery/yaps");
    } catch {
      toast.error("Something went wrong. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-transparent">
      {/* Background glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/9"
      />

      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-16 right-1/4 h-52 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/6"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}

        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:bg-emerald-400" />

            {["Admin Portal", "Yappery", "Yaps"].map((crumb) => (
              <span key={crumb} className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-white/35">
                  {crumb}
                </span>

                <span className="text-neutral-200 dark:text-white/15">/</span>
              </span>
            ))}

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600/70 dark:text-emerald-500/55">
              New Yap
            </span>
          </div>

          <div className="mb-5 h-0.5 w-7 rounded-full bg-emerald-500" />

          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white/90">
            New Yap.
            <span className="ml-2 text-neutral-300 dark:text-white/25">
              Share your thoughts.
            </span>
          </h1>

          <p className="text-sm leading-6 text-neutral-500 dark:text-white/35">
            Create something worth reading. Fill in the details below and let
            your thoughts do the talking.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* ── Basic Information ── */}

          <SectionCard
            icon={Info}
            title="Basic information"
            subtitle="The essential details of your yap"
          >
            <div>
              <label className={fieldLabel}>
                Title <span className="text-red-400/80">*</span>
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your yap a catchy title..."
                maxLength={150}
                required
                className={inputClass}
              />

              <p className="mt-1.5 text-right text-[10px] tabular-nums text-neutral-300 dark:text-white/20">
                {title.length} / 150
              </p>
            </div>

            <div className="mt-3">
              <label className={fieldLabel}>Excerpt</label>

              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short introduction to your yap. Leave empty to generate one automatically..."
                rows={3}
                maxLength={300}
                className={textareaClass}
              />

              <p className="mt-1.5 flex justify-between text-[10px] text-neutral-300 dark:text-white/20">
                <span>Optional · Generated automatically if empty</span>
                <span className="tabular-nums">{excerpt.length} / 300</span>
              </p>
            </div>

            <div className="mt-3.5">
              <label className={fieldLabel}>
                Category <span className="text-red-400/80">*</span>
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={loadingCategories}
                className={cn(
                  inputClass,
                  "appearance-none cursor-pointer disabled:cursor-wait disabled:opacity-50",
                )}
              >
                <option value="" className="bg-white dark:bg-neutral-900">
                  {loadingCategories
                    ? "Loading categories..."
                    : "Select a category"}
                </option>

                {categories.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                    className="bg-white dark:bg-neutral-900"
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              {!loadingCategories && categories.length === 0 && (
                <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
                  No categories found. Create a category before publishing a
                  yap.
                </p>
              )}
            </div>
          </SectionCard>

          {/* ── Content Editor ── */}

          <SectionCard
            icon={PenLine}
            title="Your thoughts"
            subtitle="Write your yap using Markdown"
          >
            {/* Editor toolbar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-white/[0.07] dark:bg-white/3">
                <button
                  type="button"
                  onClick={() => setEditorMode("write")}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-md px-3 text-[11px] font-medium transition-all",
                    editorMode === "write"
                      ? "bg-white text-neutral-800 shadow-sm dark:bg-white/10 dark:text-white/80"
                      : "text-neutral-400 hover:text-neutral-700 dark:text-white/35 dark:hover:text-white/70",
                  )}
                >
                  <PenLine className="size-3" />
                  Write
                </button>

                <button
                  type="button"
                  onClick={() => setEditorMode("preview")}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-md px-3 text-[11px] font-medium transition-all",
                    editorMode === "preview"
                      ? "bg-white text-neutral-800 shadow-sm dark:bg-white/10 dark:text-white/80"
                      : "text-neutral-400 hover:text-neutral-700 dark:text-white/35 dark:hover:text-white/70",
                  )}
                >
                  <Eye className="size-3" />
                  Preview
                </button>
              </div>

              <span className="text-[10px] text-neutral-400 dark:text-white/30">
                Markdown supported
              </span>
            </div>

            {editorMode === "write" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`# Start writing your yap...

Share your thoughts with the world.

## Add a heading

You can use **bold**, *italic*, lists, links and code blocks.

- First point
- Second point

\`console.log("Hello, Yappery!")\`
`}
                rows={20}
                required
                className={cn(
                  textareaClass,
                  "min-h-105 resize-y font-mono text-[12.5px] leading-[1.9]",
                )}
              />
            ) : (
              <div
                className={cn(
                  "min-h-105 rounded-xl border p-5",
                  "border-neutral-200 bg-neutral-50",
                  "dark:border-white/[0.07] dark:bg-white/4",
                )}
              >
                {content.trim() ? (
                  <pre className="whitespace-pre-wrap wrap-break-word font-sans text-[13px] leading-[1.9] text-neutral-700 dark:text-white/70">
                    {content}
                  </pre>
                ) : (
                  <div className="flex min-h-95 flex-col items-center justify-center gap-2 text-neutral-400 dark:text-white/25">
                    <FileText className="size-7" />
                    <p className="text-xs">Nothing to preview yet</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[10px] text-neutral-400 dark:text-white/25">
                Use Markdown syntax to structure your content.
              </p>

              <p className="shrink-0 text-[10px] tabular-nums text-neutral-300 dark:text-white/20">
                {content.trim()
                  ? content.trim().split(/\s+/).length
                  : 0}{" "}
                words
              </p>
            </div>
          </SectionCard>

          {/* ── Tags ── */}

          <SectionCard
            icon={Tag}
            title="Tags"
            subtitle="Help readers discover your yap"
          >
            <TagInput tags={tags} onChange={setTags} />

            <p className="mt-2 text-[10.5px] text-neutral-400 dark:text-white/25">
              {tags.length
                ? `${tags.length} tag${tags.length !== 1 ? "s" : ""} added`
                : "Add relevant tags such as technology, programming, AI, etc."}
            </p>
          </SectionCard>

          {/* ── Cover Image ── */}

          <SectionCard
            icon={Image}
            title="Cover image"
            subtitle="Give your yap a visual identity"
          >
            <label className={fieldLabel}>Image URL</label>

            <div className="relative">
              <Link2 className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-400 dark:text-white/30" />

              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover-image.jpg"
                className={cn(inputClass, "pl-9")}
              />
            </div>

            <p className="mt-2 text-[10.5px] text-neutral-400 dark:text-white/25">
              Optional · Provide a publicly accessible image URL.
            </p>

            {coverImage.trim() && (
              <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-white/[0.07]">
                <div className="border-b border-neutral-200 px-3 py-2 dark:border-white/[0.07]">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-white/35">
                    Image preview
                  </p>
                </div>

                <img
                  src={coverImage}
                  alt="Yap cover preview"
                  className="max-h-64 w-full bg-neutral-100 object-cover dark:bg-white/5"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                  }}
                />
              </div>
            )}
          </SectionCard>

          {/* ── Visibility ── */}

          <SectionCard
            icon={Sparkles}
            title="Visibility"
            subtitle="Choose when your yap becomes public"
          >
            <button
              type="button"
              onClick={() => setIsPublished((prev) => !prev)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-neutral-700 dark:text-white/70">
                    Publish immediately
                  </p>

                  <span
                    className={cn(
                      "rounded-[5px] border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider",
                      isPublished
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
                    )}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="mt-1 max-w-md text-[12px] leading-5 text-neutral-400 dark:text-white/30">
                  {isPublished
                    ? "Your yap will be published and visible to everyone."
                    : "Your yap will be saved as a draft. You can publish it later."}
                </p>
              </div>

              <div
                className={cn(
                  "relative flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
                  isPublished
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-neutral-300 bg-neutral-200 dark:border-white/15 dark:bg-white/10",
                )}
              >
                <span
                  className={cn(
                    "absolute size-4.5 rounded-full bg-white shadow-sm transition-transform",
                    isPublished ? "translate-x-5.25" : "translate-x-0.75",
                  )}
                />
              </div>
            </button>
          </SectionCard>

          {/* ── Actions ── */}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link
              href="/developer-dashboard/admin-portal/yappery/yaps"
              className="flex items-center gap-2 text-[12px] text-neutral-400 transition-colors hover:text-neutral-700 dark:text-white/30 dark:hover:text-white/60"
            >
              <ArrowLeft className="size-3.5" />
              Back to yaps
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
                  "dark:hover:bg-white/5 dark:hover:text-white/60",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || loadingCategories || categories.length === 0}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-xl px-5 text-[12.5px] font-semibold",
                  "transition-all duration-150 active:scale-[0.98]",
                  "border border-emerald-200 bg-emerald-50 text-emerald-700",
                  "hover:border-emerald-300 hover:bg-emerald-100",
                  "dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
                  "dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/16",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {saving ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-300/30 border-t-emerald-500 dark:border-emerald-400/20 dark:border-t-emerald-400" />
                    Saving...
                  </>
                ) : isPublished ? (
                  <>
                    <Send className="size-3.5" />
                    Publish Yap
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Save Draft
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
