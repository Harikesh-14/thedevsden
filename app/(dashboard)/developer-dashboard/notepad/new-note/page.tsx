"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  FolderOpen,
  LoaderCircle,
  Pin,
  Save,
  Sparkles,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const CATEGORIES = [
  "Personal",
  "Ideas",
  "Development",
  "Learning",
];

export default function NewNotePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const trimmedContent = content.trim();

    return {
      words: trimmedContent
        ? trimmedContent.split(/\s+/).length
        : 0,
      characters: content.length,
      readingTime: Math.max(
        1,
        Math.ceil(
          (trimmedContent ? trimmedContent.split(/\s+/).length : 0) /
            200,
        ),
      ),
    };
  }, [content]);

  async function handleSave() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("Give your note a title first.");
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch("/notepad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          content,
          category,
          pinned,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message || "Unable to save your note. Please try again.",
        );
      }

      toast.success("Note saved successfully!");

      router.push("/developer-dashboard/notepad");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your note.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push("/developer-dashboard/notepad");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-transparent">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/9"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-16 right-1/4 h-52 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/6"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top navigation */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            onClick={handleCancel}
            className="group flex items-center gap-2 text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-white/40 dark:hover:text-white/80"
          >
            <span className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-50 dark:border-white/[0.07] dark:bg-white/3 dark:group-hover:border-emerald-500/25 dark:group-hover:bg-emerald-500/10">
              <ArrowLeft className="size-4" />
            </span>
            Back to notes
          </button>

          <div className="flex items-center gap-2 text-[10px] text-neutral-400 dark:text-white/25">
            <Clock3 className="size-3.5" />
            <span>New note</span>
          </div>
        </div>

        {/* Page heading */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:bg-emerald-400" />
            <span className="text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase dark:text-white/35">
              Personal Workspace
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white/90">
            A fresh page.
            <span className="ml-2 text-neutral-300 dark:text-white/25">
              A fresh thought.
            </span>
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500 dark:text-white/35">
            Get that thought out of your head and onto the page.
            You can always refine it later.
          </p>
        </header>

        {/* Editor */}
        <section
          className={cn(
            "overflow-hidden rounded-[22px] border backdrop-blur-xl",
            "border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.025)]",
            "dark:border-white/8 dark:bg-white/2.5 dark:shadow-none",
          )}
        >
          {/* Editor toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3.5 sm:px-7 dark:border-white/6">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400">
                <FileText className="size-4" />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-neutral-700 dark:text-white/70">
                  Note editor
                </p>
                <p className="mt-0.5 text-[9px] text-neutral-400 dark:text-white/25">
                  Your private workspace
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPinned((value) => !value)}
              aria-pressed={pinned}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-medium transition-all",
                pinned
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 dark:border-white/8 dark:bg-white/2 dark:text-white/35 dark:hover:bg-white/5",
              )}
            >
              <Pin className={cn("size-3.5", pinned && "fill-current")} />
              {pinned ? "Pinned" : "Pin note"}
            </button>
          </div>

          {/* Title and category */}
          <div className="px-5 pt-6 sm:px-7 sm:pt-8">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your note a title..."
              aria-label="Note title"
              maxLength={200}
              autoFocus
              className={cn(
                "w-full border-0 bg-transparent text-2xl font-semibold tracking-tight text-neutral-900 outline-none",
                "placeholder:text-neutral-300 sm:text-[28px]",
                "dark:text-white/90 dark:placeholder:text-white/15",
              )}
            />

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-white/25">
                <FolderOpen className="size-3.5" />
                Category
              </span>

              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all",
                      category === item
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "border-transparent bg-neutral-100/80 text-neutral-500 hover:border-neutral-200 dark:bg-white/[0.035] dark:text-white/35 dark:hover:border-white/10",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Writing area */}
          <div className="px-5 pb-5 pt-7 sm:px-7 sm:pb-7 sm:pt-9">
            <div className="mb-3 flex items-center gap-2">
              <Type className="size-3.5 text-neutral-300 dark:text-white/20" />
              <span className="text-[10px] font-medium tracking-wide text-neutral-400 dark:text-white/25">
                YOUR THOUGHTS
              </span>
            </div>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Start writing here...

An idea, something you learned, a thought worth keeping — whatever it is, give it a little space."
              aria-label="Note content"
              className={cn(
                "min-h-85 w-full resize-y border-0 bg-transparent text-[13px] leading-loose text-neutral-700 outline-none",
                "placeholder:text-neutral-300 sm:min-h-100",
                "dark:text-white/65 dark:placeholder:text-white/15",
              )}
            />

            {/* Writing statistics */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-white/6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-neutral-400 dark:text-white/25">
                <span className="flex items-center gap-1.5">
                  <Type className="size-3" />
                  {stats.words} words
                </span>

                <span>{stats.characters} characters</span>

                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-3" />
                  {stats.readingTime} min read
                </span>
              </div>

              <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-white/25">
                <Sparkles className="size-3 text-emerald-500/70" />
                One thought at a time.
              </span>
            </div>
          </div>
        </section>

        {/* Footer actions */}
        <footer className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] leading-5 text-neutral-400 dark:text-white/25">
            Your note will be saved to your collection.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-[11px] font-semibold text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-white/8 dark:bg-white/2.5 dark:text-white/40 dark:hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-xl px-4",
                "text-[11px] font-semibold transition-all active:scale-[0.98]",
                "border border-emerald-200 bg-emerald-50 text-emerald-700",
                "hover:border-emerald-300 hover:bg-emerald-100",
                "dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
                "dark:hover:border-emerald-500/35 dark:hover:bg-emerald-500/15",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {saving ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}

              {saving ? "Saving..." : "Save note"}
              {!saving && <Check className="size-3.5" />}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}