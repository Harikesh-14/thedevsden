"use client";

import {
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  Globe,
  LockKeyhole,
  Map,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type Visibility = "private" | "public" | "unlisted";

type CreateRoadmapPayload = {
  title: string;
  slug: string;
  description: string;
  visibility: Visibility;
};

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function RoadmapCreatorPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] =
    useState<Visibility>("private");

  const [slugEdited, setSlugEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(createSlug(title));
    }
  }, [title, slugEdited]);

  const titleError =
    title.trim().length > 0 && title.trim().length < 3
      ? "Title must contain at least 3 characters."
      : title.length > 100
        ? "Title cannot exceed 100 characters."
        : "";

  const slugError =
    slugTouched && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
      ? "Use lowercase letters, numbers, and single hyphens."
      : slug.length > 120
        ? "Slug cannot exceed 120 characters."
        : "";

  const canSubmit =
    title.trim().length >= 3 &&
    title.trim().length <= 100 &&
    slug.length <= 120 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    !isSubmitting;

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSlugTouched(true);

    if (!canSubmit) {
      toast.error("Please check the highlighted fields.");
      return;
    }

    if (!API_URL) {
      toast.error("API URL is not configured.");
      return;
    }

    const payload: CreateRoadmapPayload = {
      title: title.trim(),
      slug,
      description: description.trim(),
      visibility,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/roadmap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(result?.message)
          ? result.message.join(" ")
          : result?.message;

        throw new Error(
          message || "Unable to create your roadmap.",
        );
      }

      toast.success("Roadmap created successfully!");

      const roadmapId = result?._id ?? result?.id;

      if (roadmapId) {
        router.push(
          `/developer-dashboard/roadmap/${roadmapId}`,
        );
      } else {
        router.push("/developer-dashboard/roadmap");
      }

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Navigation */}
        <Link
          href="/developer-dashboard/roadmap"
          className="group mb-8 inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition-colors hover:text-emerald-700 dark:text-white/40 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to roadmaps
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Plus className="size-3.5" />
            </span>

            <span className="text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase dark:text-white/35">
              Learning & Growth
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white/90">
            Create a roadmap.
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500 dark:text-white/35">
            Give your next big goal a name. You can add topics,
            milestones, and connections after creating it.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
            {/* Form */}
            <div className="space-y-5">
              <section
                className={cn(
                  "rounded-[20px] border p-5 sm:p-6",
                  "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
                  "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
                )}
              >
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Map className="size-4" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-neutral-800 dark:text-white/85">
                      The essentials
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-neutral-400 dark:text-white/35">
                      Start with the basics. You can refine
                      everything later.
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="title"
                      className="text-xs font-semibold text-neutral-700 dark:text-white/70"
                    >
                      Roadmap title
                      <span className="ml-1 text-emerald-600">*</span>
                    </label>

                    <span className="text-[10px] text-neutral-400 dark:text-white/25">
                      {title.length}/100
                    </span>
                  </div>

                  <input
                    id="title"
                    autoFocus
                    required
                    minLength={3}
                    maxLength={100}
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. AI Engineering"
                    aria-invalid={!!titleError}
                    className={cn(
                      "h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-all",
                      "border-neutral-200 bg-white text-neutral-800 placeholder:text-neutral-400",
                      "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10",
                      "dark:border-white/8 dark:bg-white/3 dark:text-white/85 dark:placeholder:text-white/20",
                      "dark:focus:border-emerald-500/40",
                      titleError && "border-red-400 focus:border-red-400",
                    )}
                  />

                  {titleError && (
                    <p className="mt-2 text-xs text-red-500">
                      {titleError}
                    </p>
                  )}

                  <p className="mt-2 text-[11px] text-neutral-400 dark:text-white/25">
                    Choose a name that makes your goal instantly clear.
                  </p>
                </div>

                {/* Slug */}
                <div className="mb-5">
                  <label
                    htmlFor="slug"
                    className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-white/70"
                  >
                    URL slug
                    <span className="ml-2 font-normal text-neutral-400 dark:text-white/25">
                      Unique identifier
                    </span>
                  </label>

                  <div
                    className={cn(
                      "flex h-11 overflow-hidden rounded-xl border transition-all",
                      "border-neutral-200 bg-neutral-50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/10",
                      "dark:border-white/8 dark:bg-white/2 dark:focus-within:border-emerald-500/40",
                      slugError && "border-red-400",
                    )}
                  >
                    <span className="flex items-center border-r border-neutral-200 px-3 text-xs text-neutral-400 dark:border-white/[0.07] dark:text-white/25">
                      /roadmaps/
                    </span>

                    <input
                      id="slug"
                      required
                      maxLength={120}
                      value={slug}
                      onChange={(event) => {
                        setSlugEdited(true);
                        setSlugTouched(true);
                        setSlug(createSlug(event.target.value));
                      }}
                      onBlur={() => setSlugTouched(true)}
                      placeholder="ai-engineering"
                      aria-invalid={!!slugError}
                      className="min-w-0 flex-1 bg-white px-3 text-xs text-neutral-700 outline-none dark:bg-transparent dark:text-white/70"
                    />
                  </div>

                  {slugError ? (
                    <p className="mt-2 text-xs text-red-500">
                      {slugError}
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-neutral-400 dark:text-white/25">
                      Generated from the title. You can customize it.
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="description"
                      className="text-xs font-semibold text-neutral-700 dark:text-white/70"
                    >
                      Description
                      <span className="ml-2 font-normal text-neutral-400 dark:text-white/25">
                        Optional
                      </span>
                    </label>

                    <span className="text-[10px] text-neutral-400 dark:text-white/25">
                      {description.length}/1000
                    </span>
                  </div>

                  <textarea
                    id="description"
                    rows={4}
                    maxLength={1000}
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="What do you want to learn? What will you be able to do when you're done?"
                    className={cn(
                      "w-full resize-y rounded-xl border px-3.5 py-3 text-sm leading-6 outline-none transition-all",
                      "border-neutral-200 bg-white text-neutral-700 placeholder:text-neutral-400",
                      "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10",
                      "dark:border-white/8 dark:bg-white/3 dark:text-white/75 dark:placeholder:text-white/20",
                      "dark:focus:border-emerald-500/40",
                    )}
                  />

                  <p className="mt-2 text-[11px] text-neutral-400 dark:text-white/25">
                    A little context helps future-you remember why
                    you started.
                  </p>
                </div>
              </section>

              {/* Visibility */}
              <section
                className={cn(
                  "rounded-[20px] border p-5 sm:p-6",
                  "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
                  "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
                )}
              >
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Eye className="size-4" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-neutral-800 dark:text-white/85">
                      Who can see it?
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-neutral-400 dark:text-white/35">
                      Choose how your roadmap should be shared.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {(
                    [
                      {
                        value: "private",
                        label: "Private",
                        description: "Only you can access it.",
                        icon: LockKeyhole,
                      },
                      {
                        value: "unlisted",
                        label: "Unlisted",
                        description: "Accessible through its direct link.",
                        icon: Eye,
                      },
                      {
                        value: "public",
                        label: "Public",
                        description: "Visible to everyone.",
                        icon: Globe,
                      },
                    ] as const
                  ).map((option) => {
                    const Icon = option.icon;
                    const selected =
                      visibility === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setVisibility(option.value)
                        }
                        aria-pressed={selected}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                          selected
                            ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/[0.07]"
                            : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 dark:border-white/[0.07] dark:hover:border-white/12 dark:hover:bg-white/2.5",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            selected
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                              : "bg-neutral-100 text-neutral-500 dark:bg-white/5 dark:text-white/40",
                          )}
                        >
                          <Icon className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-neutral-800 dark:text-white/80">
                            {option.label}
                          </p>
                          <p className="mt-1 text-[11px] leading-5 text-neutral-500 dark:text-white/35">
                            {option.description}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-neutral-950"
                              : "border-neutral-300 dark:border-white/15",
                          )}
                        >
                          {selected && <Check className="size-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    router.push("/developer-dashboard/roadmap")
                  }
                  className="h-11 rounded-xl border border-neutral-200 px-5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-white/10 dark:text-white/55 dark:hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "group flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold transition-all active:scale-[0.98]",
                    "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
                    "dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
                    "dark:hover:border-emerald-500/35 dark:hover:bg-emerald-500/15",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-600/25 border-t-emerald-600 dark:border-emerald-400/25 dark:border-t-emerald-400" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 transition-transform group-hover:rotate-90" />
                      Create roadmap
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live preview */}
            <aside className="lg:sticky lg:top-8">
              <div
                className={cn(
                  "overflow-hidden rounded-[20px] border",
                  "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
                  "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
                )}
              >
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-white/6">
                  <div>
                    <p className="text-xs font-semibold text-neutral-800 dark:text-white/80">
                      Live preview
                    </p>
                    <p className="mt-1 text-[10px] text-neutral-400 dark:text-white/30">
                      Your roadmap card
                    </p>
                  </div>

                  <Sparkles className="size-4 text-emerald-600/70 dark:text-emerald-400/60" />
                </div>

                <div className="p-4">
                  <article
                    className={cn(
                      "group rounded-[17px] border p-4 transition-colors",
                      "border-neutral-200 bg-white hover:border-emerald-300",
                      "dark:border-white/[0.07] dark:bg-white/2 dark:hover:border-white/[0.14]",
                    )}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[9px] font-semibold tracking-wide text-neutral-500 dark:border-white/8 dark:bg-white/4 dark:text-white/40">
                        {visibility.toUpperCase()}
                      </span>

                      <ArrowUpRight className="size-4 text-neutral-300 dark:text-white/20" />
                    </div>

                    <h3 className="wrap-break-word text-sm font-semibold tracking-tight text-neutral-900 dark:text-white/88">
                      {title.trim() || "Your roadmap title"}
                    </h3>

                    <p className="mt-2 min-h-15 whitespace-pre-wrap wrap-break-word text-xs leading-[1.7] text-neutral-500 dark:text-white/35">
                      {description.trim() ||
                        "Your description will appear here. Explain what you want to learn and why it matters to you."}
                    </p>

                    <div className="mt-5 border-t border-neutral-100 pt-3 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-white/30">
                        <Map className="size-3.5" />
                        No milestones yet
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/8">
                        <div className="h-full w-0 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      </div>
                    </div>
                  </article>

                  <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-500/5">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                    <p className="text-[11px] leading-5 text-neutral-600 dark:text-white/40">
                      Don't worry about getting everything perfect.
                      You can build your roadmap one node at a time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[17px] border border-neutral-200/80 p-4 dark:border-white/6">
                <p className="text-[11px] font-semibold text-neutral-700 dark:text-white/65">
                  What happens next?
                </p>

                <div className="mt-3 space-y-3">
                  {[
                    "Create your roadmap",
                    "Add your first topic",
                    "Connect related topics",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-2.5"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-[10px] font-medium text-neutral-500 dark:border-white/10 dark:text-white/40">
                        {index + 1}
                      </span>

                      <span className="text-[11px] text-neutral-500 dark:text-white/40">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}