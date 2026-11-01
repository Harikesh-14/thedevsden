"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  FileText,
  FolderOpen,
  LoaderCircle,
  Plus,
  Search,
  StickyNote,
  Trash2,
  Pin,
  Pencil,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type Note = {
  _id: string;
  title: string;
  content: string;
  category: string;
  pinned?: boolean;
  updatedAt?: string;
};

const INITIAL_NOTES: Note[] = [
  {
    _id: "1",
    title: "Ideas for the next project",
    content:
      "Build a lightweight developer workspace with a roadmap editor, notes, and a place to collect ideas before turning them into actual projects. kcsdnkcns csdncksdn cisdcnsdkjclsd cds lc scdsnc dsjcjlds cls doc ods cjods cjndsjcdsjo cods co dsndcnodcoisdncods co sdc c",
    category: "Ideas",
    pinned: true,
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "NestJS learning notes",
    content:
      "Review modules, providers, dependency injection, guards, interceptors, and custom decorators. Build a small API to practise each concept.",
    category: "Development",
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "3",
    title: "Things to research",
    content:
      "Explore vector databases, embedding models, retrieval augmented generation, and how local language models handle inference.",
    category: "Learning",
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "4",
    title: "Website improvements",
    content:
      "Refine the dashboard navigation, improve empty states, review responsive layouts, and make sure both themes feel equally polished.",
    category: "Ideas",
    updatedAt: new Date().toISOString(),
  },
];

const categories = ["All notes", "Ideas", "Development", "Learning", "Personal"];

export default function NotepadPage() {

  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All notes");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotes() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch("/notepad");

        if (!response.ok) {
          throw new Error("Failed to fetch notes.");
        }

        const data: Note[] = await response.json();

        if (!cancelled) {
          setNotes(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Something went wrong while loading your notes.";

          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesSearch = `${note.title} ${note.content} ${note.category}`
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesCategory =
          activeCategory === "All notes" ||
          note.category === activeCategory;

        const matchesPinned = !showPinnedOnly || note.pinned;

        return matchesSearch && matchesCategory && matchesPinned;
      })
      .sort(
        (a, b) =>
          Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
      );
  }, [notes, search, activeCategory, showPinnedOnly]);

  const pinnedCount = notes.filter((note) => note.pinned).length;

  const stats = [
    {
      label: "Total notes",
      value: notes.length,
      icon: StickyNote,
    },
    {
      label: "Pinned notes",
      value: pinnedCount,
      icon: Pin,
    },
    {
      label: "Categories",
      value: new Set(notes.map((note) => note.category)).size,
      icon: FolderOpen,
    },
  ];

  function handleCreateNote() {
    router.push("/developer-dashboard/notepad/new-note");
  }

  function handleOpenNote(id: string) {
    router.push(`/developer-dashboard/notepad/${id}`);
  }


  async function handleDeleteNote(id: string) {
    try {
      const response = await apiFetch(`/notepad/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note.");
      }

      setNotes((previous) =>
        previous.filter((note) => note._id !== id),
      );

      toast.success("Note deleted successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the note.",
      );
    }
  }

  async function handleTogglePin(id: string) {
    const note = notes.find((item) => item._id === id);

    if (!note) return;

    const nextPinned = !note.pinned;

    try {
      const response = await apiFetch(`/notepad/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinned: nextPinned,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pin status.");
      }

      const updatedNote: Note = await response.json();

      setNotes((previous) =>
        previous.map((item) =>
          item._id === id ? updatedNote : item,
        ),
      );

      toast.success(
        nextPinned ? "Note pinned." : "Note unpinned.",
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the note.",
      );
    }
  }

  function formatDate(date?: string) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  function getPreview(content: string) {
    return content.replace(/\s+/g, " ").trim() || "No content yet.";
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
              Your notes.
              <span className="ml-2 text-neutral-300 dark:text-white/25">
                Your thoughts.
              </span>
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-white/35">
              A quiet space to capture ideas, organise thoughts, and keep
              the important things close.
            </p>
          </div>

          <button
            onClick={handleCreateNote}
            className={cn(
              "group flex h-10 items-center justify-center gap-2 rounded-xl px-4",
              "text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.98]",
              "border border-emerald-200 bg-emerald-50 text-emerald-700",
              "hover:border-emerald-300 hover:bg-emerald-100",
              "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-400/80",
              "dark:hover:border-emerald-500/35 dark:hover:bg-emerald-500/13",
            )}
          >
            <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
            New note
          </button>
        </header>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className={cn(
                "rounded-[18px] border p-4 backdrop-blur-xl",
                "border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
                "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-neutral-400 dark:text-white/30">
                  {label}
                </p>
                <Icon className="size-4 text-emerald-600/70 dark:text-emerald-400/50" />
              </div>

              <p className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-neutral-800 dark:text-white/88">
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* Search and filters */}
        <section className="mb-7 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400 dark:text-white/25" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your notes..."
                aria-label="Search notes"
                className={cn(
                  "h-10 w-full rounded-xl pr-10 pl-10 text-[12.5px] outline-none transition-all",
                  "border border-neutral-200 bg-white text-neutral-700",
                  "placeholder:text-neutral-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/10",
                  "dark:border-white/[0.07] dark:bg-white/4 dark:text-white/70",
                  "dark:placeholder:text-white/20 dark:focus:border-emerald-500/30 dark:focus:ring-0",
                )}
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:text-white/30 dark:hover:text-white/70"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowPinnedOnly((value) => !value)}
              aria-pressed={showPinnedOnly}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-[11.5px] font-medium transition-colors",
                showPinnedOnly
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 dark:border-white/[0.07] dark:bg-white/3 dark:text-white/40 dark:hover:bg-white/5",
              )}
            >
              <Pin className="size-3.5" />
              Pinned only
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-[10.5px] font-medium transition-all",
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "border-transparent bg-neutral-100/80 text-neutral-500 hover:border-neutral-200 hover:bg-neutral-100 dark:bg-white/3 dark:text-white/35 dark:hover:border-white/10 dark:hover:bg-white/5",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {/* Notes collection */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-800 dark:text-white/80">
                {showPinnedOnly ? "Pinned notes" : "Your collection"}
              </h2>
              <p className="mt-1 text-[11px] text-neutral-400 dark:text-white/30">
                All those little thoughts, in one place.
              </p>
            </div>

            <span className="text-[11px] text-neutral-400 dark:text-white/30">
              {filteredNotes.length}{" "}
              {filteredNotes.length === 1 ? "note" : "notes"}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoaderCircle className="size-6 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="rounded-[18px] border border-dashed border-neutral-200 px-5 py-16 text-center dark:border-white/10">
              <p className="text-sm font-medium text-neutral-700 dark:text-white/70">
                Couldn't load your notes
              </p>

              <p className="mt-2 text-xs text-neutral-400 dark:text-white/35">
                Check your connection and try again.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                Try again
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-neutral-200 px-5 py-16 text-center dark:border-white/10">
              <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400">
                <FileText className="size-5" />
              </div>

              <p className="text-sm font-medium text-neutral-600 dark:text-white/60">
                No notes found
              </p>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-neutral-400 dark:text-white/30">
                {search
                  ? "Try a different search term or clear your filters."
                  : "Your next great idea deserves a place to live. Create a note to get started."}
              </p>

              {!search && activeCategory === "All notes" && (
                <button
                  onClick={handleCreateNote}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  <Plus className="size-3.5" />
                  Create your first note
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <ContextMenu key={note._id}>
                  <ContextMenuTrigger>
                    <article
                      onClick={() => handleOpenNote(note._id)}
                      className={cn(
                        "group relative flex min-h-60 cursor-pointer flex-col overflow-hidden rounded-[20px] transition-all duration-200",
                        "border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]",
                        "hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]",
                        "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
                        "dark:hover:border-white/[0.14] dark:hover:bg-white/5",
                      )}
                    >
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[9px] font-semibold tracking-wide text-neutral-500 dark:border-white/8 dark:bg-white/4 dark:text-white/40">
                            <FolderOpen className="size-3" />
                            {note.category}
                          </span>

                          <div className="flex items-center gap-2">
                            {note.pinned && (
                              <Pin className="size-3.5 fill-emerald-500/15 text-emerald-600 dark:text-emerald-400" />
                            )}
                            <ArrowUpRight className="size-4 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600 dark:text-white/20 dark:group-hover:text-emerald-400" />
                          </div>
                        </div>

                        <h3 className="text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-white/88">
                          {note.title || "Untitled note"}
                        </h3>

                        <p className="mt-2 line-clamp-4 text-[12px] leading-[1.8] text-neutral-500 dark:text-white/35">
                          {getPreview(note.content)}
                        </p>

                        <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-5 dark:border-white/5">
                          <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-white/25">
                            <Clock3 className="size-3" />
                            {formatDate(note.updatedAt)}
                          </span>

                          <span className="text-[10px] font-medium text-neutral-400 transition-colors group-hover:text-emerald-600 dark:text-white/20 dark:group-hover:text-emerald-400">
                            Open note
                          </span>
                        </div>
                      </div>
                    </article>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-48">
                    <ContextMenuLabel>Note options</ContextMenuLabel>

                    <ContextMenuItem
                      className="cursor-pointer"
                      onClick={() => handleOpenNote(note._id)}
                    >
                      <BookOpen className="mr-2 size-4" />
                      Open note
                    </ContextMenuItem>

                    <ContextMenuItem
                      className="cursor-pointer"
                      onClick={() => handleTogglePin(note._id)}
                    >
                      <Pin className="mr-2 size-4" />
                      {note.pinned ? "Unpin note" : "Pin note"}
                    </ContextMenuItem>

                    <ContextMenuItem
                      className="cursor-pointer"
                      onClick={() => handleOpenNote(note._id)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit note
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem
                      className="cursor-pointer text-red-500 focus:text-red-500"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete note
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}

              {/* Create note card */}
              <button
                onClick={handleCreateNote}
                className={cn(
                  "group flex min-h-60 flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed text-center transition-all duration-200",
                  "border-neutral-200 bg-neutral-50/80 hover:border-emerald-300 hover:bg-emerald-50/60",
                  "dark:border-white/9 dark:bg-white/1.5 dark:hover:border-emerald-500/25 dark:hover:bg-emerald-500/3",
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all group-hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400/60">
                  <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-neutral-500 transition-colors group-hover:text-emerald-700 dark:text-white/40 dark:group-hover:text-white/60">
                    Create a note
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400 dark:text-white/20">
                    Capture that next big idea
                  </p>
                </div>
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}