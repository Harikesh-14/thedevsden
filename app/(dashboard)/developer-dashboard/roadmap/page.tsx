"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Map,
  Plus,
  Route,
  LoaderCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Roadmap = {
  _id: string;
  title: string;
  description: string;
  slug: string;
  visibility: string;
  updatedAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function RoadmapPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoadmaps() {
      if (!API_URL) {
        setError("NEXT_PUBLIC_BACKEND_URL is not configured.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL.replace(/\/+$/, "")}/roadmap`);
        if (!res.ok) {
          throw new Error("Failed to fetch roadmaps from backend.");
        }
        const data = await res.json();
        setRoadmaps(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        toast.error("Failed to load roadmaps from backend.");
      } finally {
        setLoading(false);
      }
    }

    fetchRoadmaps();
  }, []);

  const filteredRoadmaps = roadmaps.filter((roadmap) =>
    `${roadmap.title} ${roadmap.description || ""} ${roadmap.slug}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const stats = [
    {
      label: "Total roadmaps",
      value: roadmaps.length,
      icon: Map,
    },
    {
      label: "Public roadmaps",
      value: roadmaps.filter((r) => r.visibility === "public").length,
      icon: Route,
    },
    {
      label: "Private / Unlisted",
      value: roadmaps.filter((r) => r.visibility !== "public").length,
      icon: CheckCircle2,
    },
  ];

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
                Learning & Growth
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white/90">
              Your roadmaps.
              <span className="ml-2 text-neutral-300 dark:text-white/25">
                Your journey.
              </span>
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-white/35">
              Turn ambitious goals into clear, actionable milestones.
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/developer-dashboard/roadmap/new-roadmap")
            }
            className={cn(
              "group flex h-10 items-center gap-2 rounded-xl px-4",
              "text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.98]",
              "border border-emerald-200 bg-emerald-50 text-emerald-700",
              "hover:border-emerald-300 hover:bg-emerald-100",
              "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-400/80",
              "dark:hover:border-emerald-500/35 dark:hover:bg-emerald-500/13"
            )}
          >
            <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
            New roadmap
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
                "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none"
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

        {/* Search */}
        <div className="mb-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your roadmaps..."
            aria-label="Search roadmaps"
            className={cn(
              "h-10 w-full rounded-xl px-4 outline-none transition-all sm:max-w-sm",
              "border border-neutral-200 bg-white text-[12.5px] text-neutral-700",
              "placeholder:text-neutral-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/10",
              "dark:border-white/[0.07] dark:bg-white/4 dark:text-white/70",
              "dark:placeholder:text-white/20 dark:focus:border-emerald-500/30 dark:focus:ring-0"
            )}
          />
        </div>

        {/* Roadmap collection */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-800 dark:text-white/80">
                Your collection
              </h2>
              <p className="mt-1 text-[11px] text-neutral-400 dark:text-white/30">
                Pick up where you left off.
              </p>
            </div>

            <span className="text-[11px] text-neutral-400 dark:text-white/30">
              {filteredRoadmaps.length} roadmaps
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoaderCircle className="size-6 animate-spin text-emerald-500" />
            </div>
          ) : filteredRoadmaps.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-neutral-200 py-16 text-center dark:border-white/10">
              <p className="text-sm font-medium text-neutral-500 dark:text-white/50">
                No roadmaps found
              </p>
              <p className="mt-1 text-xs text-neutral-400 dark:text-white/25">
                {error ? error : "Try creating your first roadmap or adjusting your search."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRoadmaps.map((roadmap) => (
                <article
                  key={roadmap._id}
                  onClick={() =>
                    router.push(
                      `/developer-dashboard/roadmap/${roadmap._id}`
                    )
                  }
                  className={cn(
                    "group flex min-h-64 cursor-pointer flex-col overflow-hidden rounded-[20px] transition-all duration-200",
                    "border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]",
                    "hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]",
                    "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
                    "dark:hover:border-white/[0.14] dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[9px] font-semibold tracking-wide text-neutral-500 uppercase dark:border-white/8 dark:bg-white/4 dark:text-white/40">
                        {roadmap.visibility || "private"}
                      </span>

                      <ArrowUpRight className="size-4 text-neutral-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:text-white/20 dark:group-hover:text-emerald-400" />
                    </div>

                    <h3 className="text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-white/88">
                      {roadmap.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-[12px] leading-[1.7] text-neutral-500 dark:text-white/35">
                      {roadmap.description || "No description provided."}
                    </p>

                    <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-white/30 truncate max-w-32.5">
                        /{roadmap.slug}
                      </span>

                      <span className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-white/25">
                        <Clock3 className="size-3" />
                        {roadmap.updatedAt
                          ? new Date(roadmap.updatedAt).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}

              {/* New roadmap card */}
              <button
                onClick={() =>
                  router.push("/developer-dashboard/roadmap/new-roadmap")
                }
                className={cn(
                  "group flex min-h-64 flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed text-center transition-all duration-200",
                  "border-neutral-200 bg-neutral-50/80 hover:border-emerald-300 hover:bg-emerald-50/60",
                  "dark:border-white/9 dark:bg-white/1.5 dark:hover:border-emerald-500/25 dark:hover:bg-emerald-500/3"
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all group-hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07] dark:text-emerald-400/60">
                  <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-neutral-500 transition-colors group-hover:text-emerald-700 dark:text-white/30 dark:group-hover:text-white/50">
                    Create a roadmap
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400 dark:text-white/20">
                    Break your next goal into milestones
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