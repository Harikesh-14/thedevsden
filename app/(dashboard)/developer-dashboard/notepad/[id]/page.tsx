"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock3,
  FileText,
  FolderOpen,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Pencil,
  Trash2,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
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

type ViewMode = "grid" | "list";

const CATEGORIES = [
  "Personal",
  "Ideas",
  "Development",
  "Learning",
];

function getWordCount(content: string) {
  const trimmed = content.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

// ── Note action menu ────────────────────────────────────────────────────────

function NoteActionMenu({
  note,
  onEdit,
  onTogglePin,
  onDelete,
}: {
  note: Note;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const actions = [
    {
      label: note.pinned ? "Unpin note" : "Pin note",
      icon: Pin,
      onClick: onTogglePin,
      danger: false,
    },
    {
      label: "Edit note",
      icon: Pencil,
      onClick: onEdit,
      danger: false,
    },
    {
      label: "Delete note",
      icon: Trash2,
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Note actions"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={cn(
          "flex size-8 items-center justify-center rounded-lg transition-all duration-150",
          "border border-neutral-200 bg-neutral-50 text-neutral-400",
          "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
          "dark:border-white/[0.07] dark:bg-white/4 dark:text-white/40",
          "dark:hover:border-white/[0.14] dark:hover:bg-white/8 dark:hover:text-white/80",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
        )}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "absolute top-full right-0 z-50 mt-2 w-44 rounded-xl p-1.5",
            "border border-neutral-200 bg-white shadow-xl shadow-neutral-900/10",
            "dark:border-white/8 dark:bg-[#151719] dark:shadow-2xl dark:shadow-black/50",
          )}
        >
          {actions.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onClick();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5",
                "text-left text-xs transition-colors",
                danger
                  ? "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white/65 dark:hover:bg-white/6 dark:hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Note card ───────────────────────────────────────────────────────────────

function NoteCard({
  note,
  view,
  onOpen,
  onEdit,
  onTogglePin,
  onDelete,
}: {
  note: Note;
  view: ViewMode;
  onOpen: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const words = getWordCount(note.content ?? "");

  return (
    <article
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-visible rounded-[20px]",
        "transition-all duration-200",
        "border border-neutral-200 bg-white",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]",
        "hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50/20",
        "hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]",
        "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
        "dark:hover:border-white/[0.14] dark:hover:bg-white/5",
        "dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
        view === "list" && "flex-row items-stretch",
      )}
    >
      <div
        className={cn(
          "h-0.75 rounded-t-[20px] bg-linear-to-r from-emerald-400/80 via-emerald-300/40 to-transparent",
          view === "list" && "hidden",
        )}
      />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col p-5",
          view === "list" && "sm:flex-row sm:items-center sm:gap-5",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                  "border border-emerald-200 bg-emerald-50 text-emerald-600",
                  "dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400",
                )}
              >
                <FileText className="size-4" />
              </div>

              <div className="min-w-0">
                <h3 className="line-clamp-2 text-[14px] leading-snug font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white/88">
                  {note.title}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[9px] font-medium text-neutral-500 dark:border-white/8 dark:bg-white/4 dark:text-white/40">
                    {note.category || "Personal"}
                  </span>

                  {note.pinned && (
                    <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Pin className="size-3 fill-current" />
                      Pinned
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <NoteActionMenu
                note={note}
                onEdit={onEdit}
                onTogglePin={onTogglePin}
                onDelete={onDelete}
              />
            </div>
          </div>

          <p
            className={cn(
              "mb-4 whitespace-pre-wrap wrap-break-word text-[12px] leading-[1.7]",
              "text-neutral-500 dark:text-white/35",
              view === "grid" ? "line-clamp-4 min-h-0" : "line-clamp-2",
            )}
          >
            {note.content?.trim() || "An empty note. Add your thoughts here."}
          </p>
        </div>

        <div
          className={cn(
            "mt-auto flex items-center justify-between gap-3 border-t pt-3",
            "border-neutral-100 dark:border-white/5",
            view === "list" && "sm:mt-0 sm:w-48 sm:shrink-0 sm:gap-2",
          )}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-neutral-400 dark:text-white/25">
            <span className="flex items-center gap-1">
              <Type className="size-3" />
              {words} words
            </span>

            <span className="flex items-center gap-1">
              <Clock3 className="size-3" />
              {formatRelativeTime(note.updatedAt ?? note.createdAt ?? new Date().toISOString())}
            </span>
          </div>

          <div
            className={cn(
              "flex size-6.5 shrink-0 items-center justify-center rounded-[8px]",
              "border border-emerald-200 bg-emerald-50 text-emerald-600",
              "transition-all duration-150 group-hover:border-emerald-300 group-hover:bg-emerald-100",
              "dark:border-emerald-500/15 dark:bg-emerald-500/6 dark:text-emerald-400/50",
              "dark:group-hover:border-emerald-500/30 dark:group-hover:bg-emerald-500/10 dark:group-hover:text-emerald-400/80",
            )}
          >
            <ArrowUpRight className="size-3" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </article>
  );
}

// ── New note card ───────────────────────────────────────────────────────────

function NewNoteCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-50 flex-col items-center justify-center gap-3 rounded-[20px]",
        "text-center transition-all duration-200",
        "border-2 border-dashed border-neutral-200 bg-neutral-50/80",
        "hover:border-emerald-300 hover:bg-emerald-50/60",
        "dark:border-white/9 dark:bg-white/1.5",
        "dark:hover:border-emerald-500/25 dark:hover:bg-emerald-500/3",
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl transition-all duration-200",
          "border border-emerald-200 bg-emerald-50 text-emerald-600",
          "group-hover:border-emerald-300 group-hover:bg-emerald-100 group-hover:text-emerald-700",
          "dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400/60",
          "dark:group-hover:border-emerald-500/35 dark:group-hover:bg-emerald-500/12 dark:group-hover:text-emerald-400/90",
        )}
      >
        <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-neutral-500 transition-colors group-hover:text-emerald-700 dark:text-white/30 dark:group-hover:text-white/50">
          New note
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-400 transition-colors group-hover:text-emerald-600 dark:text-white/15 dark:group-hover:text-white/25">
          Capture your next thought
        </p>
      </div>
    </button>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function NotepadIDPage() {
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/notepad");

      if (!response.ok) {
        throw new Error("Unable to fetch your notes.");
      }

      const data = await response.json();

      setNotes(Array.isArray(data) ? data : data.notes ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching your notes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const stats = useMemo(() => {
    const pinnedCount = notes.filter((note) => note.pinned).length;
    const totalWords = notes.reduce(
      (total, note) => total + getWordCount(note.content ?? ""),
      0,
    );
    const categoryCount = new Set(
      notes.map((note) => note.category || "Personal"),
    ).size;

    return [
      { label: "Total notes", value: notes.length, accent: false },
      { label: "Pinned", value: pinnedCount, accent: true },
      { label: "Words written", value: totalWords, accent: false },
      { label: "Categories", value: categoryCount, accent: false },
    ];
  }, [notes]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notes
      .filter((note) => {
        const matchesSearch =
          !query ||
          note.title.toLowerCase().includes(query) ||
          (note.content ?? "").toLowerCase().includes(query);

        const matchesCategory =
          category === "All" ||
          (note.category || "Personal") === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }

        return (
          new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
          new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
        );
      });
  }, [notes, search, category]);

  const openNewNote = () => {
    router.push("/developer-dashboard/notepad/new-note");
  };

  const openNote = (id: string) => {
    router.push(`/developer-dashboard/notepad/${id}`);
  };

  async function deleteNote(id: string) {
    if (deletingId) return;

    setDeletingId(id);

    try {
      const response = await apiFetch(`/notepad/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete this note.");
      }

      setNotes((previous) => previous.filter((note) => note._id !== id));
      toast.success("Note deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the note.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function togglePin(note: Note) {
    // Connect this to your backend's note-update endpoint when available.
    // Avoid updating only local state, which would lose the change on reload.
    toast.info(
      "Connect your note-update endpoint to enable pinning changes.",
    );
  }

  if (loading) return <LoaderPage />;

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
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:bg-emerald-400" />
              <span className="text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase dark:text-white/35">
                Personal Workspace
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white/90">
              Your thoughts.
              <span className="ml-2 text-neutral-300 dark:text-white/25">
                Your space.
              </span>
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-white/35">
              Keep your ideas, learning notes and little discoveries in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewNote}
            className={cn(
              "group flex h-10 items-center gap-2 rounded-xl px-4",
              "text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.98]",
              "border border-emerald-200 bg-emerald-50 text-emerald-700",
              "hover:border-emerald-300 hover:bg-emerald-100",
              "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-400/80",
              "dark:hover:border-emerald-500/35 dark:hover:bg-emerald-500/13 dark:hover:text-emerald-400",
            )}
          >
            <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
            New note
          </button>
        </header>

        {/* Stats */}
        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, accent }) => (
            <div
              key={label}
              className={cn(
                "rounded-[18px] border p-4 backdrop-blur-xl",
                "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
                "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
              )}
            >
              <p className="text-[11px] font-medium text-neutral-400 dark:text-white/30">
                {label}
              </p>
              <p
                className={cn(
                  "mt-1 text-[26px] font-semibold tracking-[-0.03em]",
                  accent
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-800 dark:text-white/88",
                )}
              >
                {value.toLocaleString()}
              </p>
            </div>
          ))}
        </section>

        {/* Search and controls */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-45 flex-1">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-400 dark:text-white/20" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your notes…"
              aria-label="Search notes"
              className={cn(
                "h-9 w-full rounded-xl pr-4 pl-9 text-[12.5px] outline-none transition-all",
                "border border-neutral-200 bg-white text-neutral-700 placeholder:text-neutral-400 shadow-sm shadow-neutral-900/4",
                "focus:border-emerald-300 focus:bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500/10",
                "dark:border-white/[0.07] dark:bg-white/4 dark:text-white/70 dark:shadow-none",
                "dark:placeholder:text-white/20 dark:focus:border-emerald-500/30 dark:focus:bg-emerald-500/4 dark:focus:ring-0",
              )}
            />
          </div>

          <div className="flex max-w-full items-center gap-1.5 overflow-x-auto">
            {["All", ...CATEGORIES].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-2 text-[10px] font-medium transition-all",
                  category === item
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-transparent bg-neutral-100/80 text-neutral-500 hover:border-neutral-200 dark:bg-white/[0.035] dark:text-white/35 dark:hover:border-white/10",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div
            className={cn(
              "flex shrink-0 gap-1 rounded-xl border p-1",
              "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
              "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
            )}
          >
            {(["grid", "list"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-label={`${item} view`}
                aria-pressed={view === item}
                onClick={() => setView(item)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-all duration-150",
                  view === item
                    ? "bg-emerald-50 text-emerald-600 dark:bg-white/8 dark:text-white/70"
                    : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-white/25 dark:hover:text-white/45",
                )}
              >
                {item === "grid" ? (
                  <LayoutGrid className="size-3.5" />
                ) : (
                  <List className="size-3.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400">
              <FolderOpen className="size-5" />
            </div>

            <p className="text-sm font-medium text-neutral-500 dark:text-white/35">
              {notes.length === 0
                ? "Your notebook starts here"
                : "No notes match your search"}
            </p>

            <p className="max-w-xs text-xs leading-5 text-neutral-400 dark:text-white/20">
              {notes.length === 0
                ? "Capture an idea, save something you learned, or write down a thought worth keeping."
                : "Try a different keyword or category to find what you're looking for."}
            </p>

            {notes.length === 0 && (
              <button
                type="button"
                onClick={openNewNote}
                className="mt-1 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/15"
              >
                <Plus className="size-3.5" />
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              view === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-3",
            )}
          >
            {filtered.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                view={view}
                onOpen={() => openNote(note._id)}
                onEdit={() => openNote(note._id)}
                onTogglePin={() => void togglePin(note)}
                onDelete={() => void deleteNote(note._id)}
              />
            ))}

            <NewNoteCard onClick={openNewNote} />
          </div>
        )}
      </div>
    </main>
  );
}