"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  CalendarDays,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IThought } from "@/lib/though-of-the-day";

export default function ThoughtOfTheDay() {
  const [searchDate, setSearchDate] = useState("");
  const [thought, setThought] = useState<IThought | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<IThought | null>(null);
  const [formThought, setFormThought] = useState("");
  const [formDate, setFormDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function formatDate(date: string) {
    if (!date) return "Select a date";
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    });
  }

  async function handleSearch() {
    if (!searchDate) {
      toast.error("Please select a date.");
      return;
    }
    setLoading(true);
    setSearched(true);
    setThought(null);
    try {
      const response = await apiFetch(`/thoughts/date/${encodeURIComponent(searchDate)}`);
      if (response.status === 404) {
        setThought(null);
        return;
      }
      if (!response.ok) {
        toast.error("Oops!", {
          description: "Failed to fetch the thought.",
          closeButton: true
        })
      }
      const data: IThought = await response.json();
      setThought(data);
    } catch (error) {
      toast.error("Oops!", {
        description: error instanceof Error ? error.message : "Something went wrong.",
        closeButton: true
      });
    } finally {
      setLoading(false);
    }
  }

  function openNewDialog() {
    setEditingThought(null);
    setFormThought("");
    setFormDate(searchDate);
    setDialogOpen(true);
  }

  function openEditDialog(item: IThought) {
    setEditingThought(item);
    setFormThought(item.thought);
    setFormDate(item.displayDate.slice(0, 10));
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formDate || !formThought.trim()) {
      toast.error("Please select a date and enter a thought.");
      return;
    }
    setSaving(true);
    try {
      const endpoint = editingThought
        ? `/thoughts/${editingThought._id}`
        : "/thoughts";
      const response = await apiFetch(endpoint, {
        method: editingThought ? "PATCH" : "POST",
        body: JSON.stringify({
          thought: formThought.trim(),
          displayDate: new Date(`${formDate}T00:00:00.000Z`).toISOString(),
        }),
      });
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("A thought already exists for this date.");
        }
        throw new Error("Unable to save the thought.");
      }
      const savedThought: IThought = await response.json();
      setDialogOpen(false);
      setSearchDate(formDate);
      setSearched(true);
      setThought(savedThought);
      toast.success(
        editingThought
          ? "Thought updated successfully."
          : "Thought created successfully."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!thought) return;

    setDeleting(true);

    try {
      const response = await apiFetch(`/thoughts/${thought._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to delete the thought.");
      }
      setThought(null);
      toast.success("Thought deleted successfully.");
    } catch (error) {
      toast.error("Oops!", {
        description: error instanceof Error ? error.message : "Something went wrong.",
        closeButton: true
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] px-3 py-5 text-[#ededed] sm:px-5">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span>Admin Portal</span>
            <span className="text-neutral-700">/</span>
            <span>TheDevsDen</span>
            <span className="text-neutral-700">/</span>
            <span className="text-emerald-500">Thoughts</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Thoughts of the day
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Search by date to view, edit, or manage daily thoughts.
          </p>
        </header>

        <section className="mb-5 rounded-xl border border-white/8 bg-[#111111] p-3">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSearch();
            }}
          >
            <div className="relative min-w-0 flex-1">
              <CalendarDays
                size={16}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <Input
                type="date"
                value={searchDate}
                onChange={(event) => setSearchDate(event.target.value)}
                className="h-9 border-white/1 bg-[#191919] pl-9 text-xs text-neutral-100 scheme-dark focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                aria-label="Search thought by date"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !searchDate}
              className="h-9 gap-1.5 border border-white/12 bg-transparent px-3 text-xs font-semibold text-neutral-100 hover:border-emerald-500/50 hover:bg-emerald-500/10"
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={14} />
              ) : (
                <Search size={14} />
              )}
              Search
            </Button>
            <Button
              type="button"
              onClick={openNewDialog}
              className="h-9 gap-1.5 bg-emerald-500 px-3 text-xs font-semibold text-black hover:bg-emerald-400"
            >
              <Plus size={15} />
              New Thought
            </Button>
          </form>
        </section>

        {searched && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                Results
              </h2>
              <div className="h-px flex-1 bg-white/6" />
              <span className="text-xs text-neutral-500">
                {loading ? "Searching..." : thought ? "1 result" : "0 results"}
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-24 items-center justify-center rounded-xl border border-white/8 bg-[#111111]">
                <LoaderCircle
                  size={18}
                  className="animate-spin text-emerald-400"
                />
              </div>
            ) : thought ? (
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <article className="group flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-[#111111] p-3 transition-colors hover:border-emerald-500/30">
                    <div className="flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/6">
                      <span className="text-base font-bold tracking-tight text-emerald-400">
                        {format(parseISO(thought.displayDate), "dd")}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                        {format(parseISO(thought.displayDate), "MMM")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium italic leading-relaxed text-neutral-300 sm:text-sm">
                        <span className="mr-0.5 font-bold text-emerald-500">
                          &ldquo;
                        </span>
                        {thought.thought}
                        <span className="ml-0.5 font-bold text-emerald-500">
                          &rdquo;
                        </span>
                      </p>
                    </div>
                  </article>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40 border-white/1 bg-[#151515] text-xs text-neutral-200">
                  <ContextMenuItem
                    onSelect={() => openEditDialog(thought)}
                    className="gap-2 cursor-pointer"
                  >
                    <Pencil size={13} />
                    Edit thought
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={() => void handleDelete()}
                    disabled={deleting}
                    className="gap-2 text-red-400 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Delete thought
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ) : (
              <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-white/8 bg-[#0d0d0d] px-4 py-10 text-center">
                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-[#151515]">
                  <Search size={16} className="text-neutral-500" />
                </div>
                <h3 className="text-xs font-semibold text-neutral-300">
                  No thought found
                </h3>
                <p className="mt-1 max-w-xs text-[11px] text-neutral-500">
                  No thought assigned to {formatDate(searchDate)}. Try another date
                  or create a new one.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openNewDialog}
                  className="mt-3 h-8 gap-1.5 border-white/1 bg-transparent px-3 text-xs text-neutral-200 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                >
                  <Plus size={14} />
                  Create Thought
                </Button>
              </div>
            )}
          </section>
        )}

        {!searched && (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 bg-[#111111]">
              <Search size={18} className="text-neutral-600" />
            </div>
            <h2 className="text-sm font-semibold text-neutral-300">
              Search for a thought
            </h2>
            <p className="mt-1 text-[11px] text-neutral-600">
              Pick a date above to find the thought assigned to that day.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingThought(null);
        }}
      >
        <DialogContent className="border-white/1 bg-[#111111] text-neutral-100 sm:max-w-sm">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-bold">
              {editingThought ? "Edit thought" : "New thought"}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              {editingThought
                ? "Make changes to this thought."
                : "Create a thought for a specific date."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <label
                htmlFor="thought-date"
                className="text-[11px] font-medium text-neutral-300"
              >
                Display Date
              </label>
              <Input
                id="thought-date"
                type="date"
                value={formDate}
                onChange={(event) => setFormDate(event.target.value)}
                className="h-8 border-white/1 bg-[#191919] text-xs scheme-darkfocus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="thought-content"
                className="text-[11px] font-medium text-neutral-300"
              >
                Thought
              </label>
              <Textarea
                id="thought-content"
                value={formThought}
                onChange={(event) => setFormThought(event.target.value)}
                placeholder="Write something worth remembering..."
                rows={3}
                maxLength={1000}
                className="resize-none border-white/1 bg-[#191919] text-xs text-neutral-100 placeholder:text-neutral-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
              />
              <p className="text-right text-[10px] text-neutral-600">
                {formThought.length}/1000
              </p>
            </div>
          </div>
          <DialogFooter className="gap-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              className="h-8 border-white/1 bg-transparent text-xs text-neutral-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !formDate || !formThought.trim()}
              className="h-8 gap-1.5 bg-emerald-500 px-3 text-xs font-semibold text-black hover:bg-emerald-400"
            >
              {saving && <LoaderCircle size={14} className="animate-spin" />}
              {editingThought ? "Save changes" : "Create thought"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}