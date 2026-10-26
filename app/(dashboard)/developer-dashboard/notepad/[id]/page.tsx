"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  Pencil,
  Pin,
  Save,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/helper-functions";
import LoaderPage from "@/components/developer-dashboard/loader";

type Note = {
  _id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type NoteDraft = {
  title: string;
  content: string;
  category: string;
};

type SaveStatus =
  | "idle"
  | "unsaved"
  | "saving"
  | "saved"
  | "error"
  | "needs-title";

const CATEGORIES = [
  "Personal",
  "Ideas",
  "Development",
  "Learning",
];

function getSnapshot(draft: NoteDraft) {
  return JSON.stringify(draft);
}

export default function NotepadIDPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [note, setNote] = useState<Note | null>(null);
  const [draft, setDraft] = useState<NoteDraft>({
    title: "",
    content: "",
    category: "Personal",
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const draftRef = useRef<NoteDraft>(draft);
  const savedSnapshotRef = useRef("");
  const savingRef = useRef(false);
  const queuedSaveRef = useRef(false);

  draftRef.current = draft;

  useEffect(() => {
    let cancelled = false;

    async function fetchNote() {
      setLoading(true);
      setLoadError(null);
      setNotFound(false);
      setNote(null);
      setEditing(false);
      setSaveStatus("idle");

      try {
        const response = await apiFetch(`/notepad/${id}`);

        if (response.status === 404) {
          if (!cancelled) {
            setNotFound(true);
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load this note.");
        }

        const data = await response.json();
        const fetchedNote: Note = data.note ?? data;

        if (!fetchedNote?._id) {
          throw new Error("The server returned an invalid note.");
        }

        const initialDraft: NoteDraft = {
          title: fetchedNote.title ?? "",
          content: fetchedNote.content ?? "",
          category: fetchedNote.category || "Personal",
        };

        if (!cancelled) {
          setNote(fetchedNote);
          setDraft(initialDraft);
          draftRef.current = initialDraft;
          savedSnapshotRef.current = getSnapshot(initialDraft);
          setSaveStatus("saved");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Something went wrong while loading this note.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchNote();

    return () => {
      cancelled = true;
    };
  }, [id]);
  
  const saveLatest = useCallback(async () => {
    if (!note) return;

    if (savingRef.current) {
      queuedSaveRef.current = true;
      return;
    }

    savingRef.current = true;

    try {
      do {
        queuedSaveRef.current = false;

        const currentDraft = { ...draftRef.current };
        const currentSnapshot = getSnapshot(currentDraft);

        if (currentSnapshot === savedSnapshotRef.current) {
          setSaveStatus("saved");
          break;
        }

        if (!currentDraft.title.trim()) {
          setSaveStatus("needs-title");
          break;
        }

        setSaveStatus("saving");

        const response = await apiFetch(`/notepad/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentDraft),
        });

        if (!response.ok) {
          const message =
            response.status === 404
              ? "This note no longer exists."
              : "Unable to save your changes.";

          throw new Error(message);
        }

        savedSnapshotRef.current = currentSnapshot;

        if (getSnapshot(draftRef.current) === currentSnapshot) {
          setSaveStatus("saved");
        } else {
          queuedSaveRef.current = true;
        }
      } while (queuedSaveRef.current);
    } catch (error) {
      setSaveStatus("error");

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your note.",
      );
    } finally {
      savingRef.current = false;
    }
  }, [id, note]);

  useEffect(() => {
    if (!editing || !note) return;

    const currentSnapshot = getSnapshot(draft);

    if (currentSnapshot === savedSnapshotRef.current) {
      setSaveStatus("saved");
      return;
    }

    if (!draft.title.trim()) {
      setSaveStatus("needs-title");
      return;
    }

    setSaveStatus("unsaved");

    const timer = window.setTimeout(() => {
      void saveLatest();
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [draft, editing, note, saveLatest]);

  function updateDraft<K extends keyof NoteDraft>(
    key: K,
    value: NoteDraft[K],
  ) {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function finishEditing() {
    await saveLatest();

    if (
      draftRef.current.title.trim() &&
      getSnapshot(draftRef.current) === savedSnapshotRef.current
    ) {
      setEditing(false);
    }
  }

  if (loading) {
    return <LoaderPage />;
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-white px-4 py-12 dark:bg-transparent">
        <div className="mx-auto max-w-xl rounded-[20px] border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-white/[0.07] dark:bg-white/3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400">
            <FileText className="size-5" />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white/90">
            Note not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-white/40">
            This note may have been deleted or the link may be incorrect.
          </p>

          <button
            type="button"
            onClick={() => router.push("/developer-dashboard/notepad")}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/15"
          >
            <ArrowLeft className="size-4" />
            Back to notes
          </button>
        </div>
      </main>
    );
  }

  if (loadError || !note) {
    return (
      <main className="min-h-screen bg-white px-4 py-12 dark:bg-transparent">
        <div className="mx-auto max-w-xl rounded-[20px] border border-neutral-200 bg-white p-8 text-center dark:border-white/[0.07] dark:bg-white/3">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white/90">
            Couldn't load this note
          </h1>

          <p className="mt-2 text-sm text-neutral-500 dark:text-white/40">
            {loadError ?? "Something went wrong."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={() => router.push("/developer-dashboard/notepad")}
            className="ml-2 rounded-xl px-4 py-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:text-white/50 dark:hover:bg-white/5"
          >
            Back to notes
          </button>
        </div>
      </main>
    );
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: "Ready",
    unsaved: "Unsaved changes",
    saving: "Saving changes…",
    saved: "All changes saved",
    error: "Couldn't save changes",
    "needs-title": "Add a title to save",
  };

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

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/developer-dashboard/notepad")}
            className="group inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/[0.07] dark:bg-white/3 dark:text-white/45 dark:hover:border-white/15 dark:hover:bg-white/5 dark:hover:text-white/80"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            All notes
          </button>

          <div className="flex items-center gap-2">
            {note.pinned && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400">
                <Pin className="size-3 fill-current" />
                Pinned
              </span>
            )}

            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({
                      title: note.title ?? "",
                      content: note.content ?? "",
                      category: note.category || "Personal",
                    });

                    draftRef.current = {
                      title: note.title ?? "",
                      content: note.content ?? "",
                      category: note.category || "Personal",
                    };

                    savedSnapshotRef.current = getSnapshot({
                      title: note.title ?? "",
                      content: note.content ?? "",
                      category: note.category || "Personal",
                    });

                    setSaveStatus("saved");
                    setEditing(false);
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-white/[0.07] dark:bg-white/3 dark:text-white/50 dark:hover:bg-white/5"
                >
                  <X className="size-3.5" />
                  Discard
                </button>

                <button
                  type="button"
                  onClick={() => void finishEditing()}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/15"
                >
                  <Check className="size-3.5" />
                  Done
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/15"
              >
                <Pencil className="size-3.5" />
                Edit note
              </button>
            )}
          </div>
        </div>

        {/* Note editor */}
        <article className="overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.035)] dark:border-white/[0.07] dark:bg-white/2.5 dark:shadow-none">
          <div className="h-1 bg-linear-to-r from-emerald-400 via-emerald-300/60 to-transparent" />

          <div className="p-5 sm:p-8 lg:p-10">
            {/* Category */}
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              {editing ? (
                <label className="inline-flex items-center gap-2">
                  <Tag className="size-3.5 text-emerald-600 dark:text-emerald-400" />

                  <select
                    value={draft.category}
                    onChange={(event) =>
                      updateDraft("category", event.target.value)
                    }
                    aria-label="Note category"
                    className="max-w-48 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600 outline-none transition-colors focus:border-emerald-300 dark:border-white/8 dark:bg-white/4 dark:text-white/65 dark:focus:border-emerald-500/30"
                  >
                    {CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-white text-neutral-800 dark:bg-neutral-900 dark:text-white"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] font-semibold tracking-wide text-neutral-500 dark:border-white/[0.07] dark:bg-white/[0.035] dark:text-white/45">
                  <Tag className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  {draft.category}
                </span>
              )}

              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-white/25">
                <Clock3 className="size-3.5" />
                Updated{" "}
                {formatRelativeTime(
                  note.updatedAt ??
                  note.createdAt ??
                  new Date().toISOString(),
                )}
              </div>
            </div>

            {/* Title */}
            {editing ? (
              <input
                value={draft.title}
                onChange={(event) =>
                  updateDraft("title", event.target.value)
                }
                maxLength={200}
                placeholder="Give your note a title..."
                aria-label="Note title"
                className={cn(
                  "w-full border-0 bg-transparent p-0",
                  "text-3xl leading-tight font-semibold tracking-[-0.035em] text-neutral-900 outline-none",
                  "placeholder:text-neutral-300 focus:ring-0 sm:text-4xl",
                  "dark:text-white/90 dark:placeholder:text-white/20",
                )}
              />
            ) : (
              <h1 className="wrap-break-word text-3xl leading-tight font-semibold tracking-[-0.035em] text-neutral-900 sm:text-4xl dark:text-white/90">
                {draft.title || "Untitled note"}
              </h1>
            )}

            <div className="my-7 h-px bg-neutral-100 dark:bg-white/6" />

            {/* Content */}
            {editing ? (
              <textarea
                value={draft.content}
                onChange={(event) =>
                  updateDraft("content", event.target.value)
                }
                placeholder="Start writing your thoughts..."
                aria-label="Note content"
                rows={16}
                className={cn(
                  "min-h-90 w-full resize-y border-0 bg-transparent p-0",
                  "text-[13px] leading-8 text-neutral-600 outline-none",
                  "placeholder:text-neutral-300 focus:ring-0 sm:text-sm",
                  "dark:text-white/65 dark:placeholder:text-white/20",
                )}
              />
            ) : (
              <div className="min-h-48">
                {draft.content.trim() ? (
                  <p className="whitespace-pre-wrap wrap-break-word text-[13px] leading-8 text-neutral-600 sm:text-sm dark:text-white/60">
                    {draft.content}
                  </p>
                ) : (
                  <p className="text-sm italic text-neutral-400 dark:text-white/25">
                    This note is empty. Select Edit note to add your thoughts.
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-5 dark:border-white/6">
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 dark:text-white/30">
                {editing ? (
                  <>
                    {saveStatus === "saving" ? (
                      <LoaderCircle className="size-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                    ) : saveStatus === "saved" ? (
                      <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : saveStatus === "error" ? (
                      <Save className="size-3.5 text-red-500" />
                    ) : (
                      <Pencil className="size-3.5" />
                    )}

                    <span
                      className={cn(
                        saveStatus === "saved" &&
                        "text-emerald-700 dark:text-emerald-400",
                        saveStatus === "error" &&
                        "text-red-500 dark:text-red-400",
                        saveStatus === "needs-title" &&
                        "text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {statusLabel[saveStatus]}
                    </span>
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5" />
                    Read-only mode
                  </>
                )}
              </div>

              {editing && saveStatus === "error" && (
                <button
                  type="button"
                  onClick={() => void saveLatest()}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
                >
                  Retry save
                </button>
              )}

              {editing && (
                <p className="text-[10px] text-neutral-400 dark:text-white/25">
                  Changes save automatically
                </p>
              )}
            </div>
          </div>
        </article>

        <p className="mt-4 text-center text-[10px] text-neutral-400 dark:text-white/20">
          {note.createdAt
            ? `Created ${formatRelativeTime(note.createdAt)}`
            : "Your personal workspace"}
        </p>
      </div>
    </main>
  );
}