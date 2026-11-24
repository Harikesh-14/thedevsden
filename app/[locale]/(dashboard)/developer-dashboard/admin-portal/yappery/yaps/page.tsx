"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Clock3,
  FileText,
  Send,
  FileEdit,
  CalendarDays,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BLOGS_PER_PAGE = 10;

type Category = {
  _id: string;
  name: string;
  slug?: string;
};

type Blog = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Category | string;
  tags: string[];
  readingTime: number;
  isPublished: boolean;
  publishedAt?: string;
  viewsCount: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
};

type BlogsResponse = {
  data: Blog[];
  total: number;
  page: number;
  totalPages: number;
};

type Filter = "all" | "published" | "drafts";
type SortOption = "newest" | "oldest" | "most-viewed";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCategoryName(category: Blog["category"]) {
  if (typeof category === "string") return "Uncategorized";
  return category?.name || "Uncategorized";
}

function formatDate(date?: string) {
  if (!date) return "Not published";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Blog Card ──────────────────────────────────────────────────────────────
function BlogCard({
  blog,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  blog: Blog;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
  onTogglePublish: (blog: Blog) => void;
}) {
  const router = useRouter();

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-[16px] border p-4 sm:flex-row sm:items-start sm:p-5 cursor-pointer",
        "border-neutral-200 bg-white shadow-xs shadow-neutral-900/4",
        "transition-all duration-150 hover:border-neutral-300 hover:shadow-sm",
        "dark:border-white/[0.07] dark:bg-white/2 dark:shadow-none",
        "dark:hover:border-white/15 dark:hover:bg-white/4",
      )}
    >
      {/* Cover image */}
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 sm:size-28 dark:border-white/10 dark:bg-white/5">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-neutral-300 dark:text-white/20">
            <BookOpen className="size-8" strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 
            className="text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-white/90"
            onClick={() => router.push(`/developer-dashboard/admin-portal/yappery/yaps/${blog.slug}`)}
          >
            {blog.title}
          </h3>

          <span
            className={cn(
              "rounded-[5px] border px-1.5 py-px text-[9px] font-semibold uppercase tracking-widest",
              blog.isPublished
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400",
            )}
          >
            {blog.isPublished ? "Published" : "Draft"}
          </span>
        </div>

        <p className="mb-2 line-clamp-2 text-[12px] leading-[1.65] text-neutral-500 dark:text-white/45">
          {blog.excerpt || "No excerpt available."}
        </p>

        {/* Metadata */}
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10.5px] text-neutral-400 dark:text-white/35">
          <span className="flex items-center gap-1">
            <FileText className="size-3" />
            {getCategoryName(blog.category)}
          </span>

          <span className="flex items-center gap-1">
            <Clock3 className="size-3" />
            {blog.readingTime} min read
          </span>

          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {blog.viewsCount.toLocaleString()} views
          </span>

          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {formatDate(blog.publishedAt)}
          </span>
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {blog.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-[6px] border border-neutral-200 bg-neutral-50 px-2 py-px text-[10px] font-medium text-neutral-500 dark:border-white/[0.07] dark:bg-white/5 dark:text-white/45"
              >
                {tag}
              </span>
            ))}

            {blog.tags.length > 4 && (
              <span className="rounded-[6px] border border-neutral-200 bg-neutral-50 px-2 py-px text-[10px] text-neutral-400 dark:border-white/[0.07] dark:bg-white/5 dark:text-white/30">
                +{blog.tags.length - 4}
              </span>
            )}
          </div>
        )}

        <p className="mt-2 truncate text-[10px] text-neutral-300 dark:text-white/20">
          /{blog.slug}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5 sm:flex-col">
        {/* Publish / Unpublish */}
        <button
          title={blog.isPublished ? "Unpublish yap" : "Publish yap"}
          onClick={() => onTogglePublish(blog)}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border transition-all",
            blog.isPublished
              ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
              : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
          )}
        >
          {blog.isPublished ? (
            <FileEdit className="size-3.5" />
          ) : (
            <Send className="size-3.5" />
          )}
        </button>

        {/* Edit */}
        <button
          title="Edit yap"
          onClick={() => onEdit(blog)}
          className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-800 dark:border-white/[0.07] dark:bg-transparent dark:text-white/30 dark:hover:border-white/15 dark:hover:text-white/80"
        >
          <Pencil className="size-3.5" />
        </button>

        {/* Delete */}
        <button
          title="Delete yap"
          onClick={() => onDelete(blog)}
          className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-white/[0.07] dark:bg-transparent dark:text-white/30 dark:hover:border-red-500/20 dark:hover:bg-red-500/[0.07] dark:hover:text-red-400"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </article>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function AdminPortalYapperyBlogsPage() {
  const router = useRouter();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  // ─── Fetch Blogs ──────────────────────────────────────────────────────────
  const fetchBlogs = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(BLOGS_PER_PAGE),
        onlyPublished: "false",
        sortBy,
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await apiFetch(`/blogs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const result: BlogsResponse = await response.json();

      setBlogs(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // ─── Client-side Filtering ─────────────────────────────────────────────────
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      if (filter === "published") return blog.isPublished;
      if (filter === "drafts") return !blog.isPublished;
      return true;
    });
  }, [blogs, filter]);

  // ─── Statistics ───────────────────────────────────────────────────────────
  const publishedCount = blogs.filter((b) => b.isPublished).length;
  const draftCount = blogs.filter((b) => !b.isPublished).length;

  const totalViews = blogs.reduce((sum, blog) => sum + blog.viewsCount, 0);

  const stats = [
    {
      label: "Total blogs",
      value: total.toLocaleString(),
      icon: BookOpen,
      accent: false,
    },
    {
      label: "Published",
      value: publishedCount.toString(),
      icon: Send,
      accent: true,
    },
    {
      label: "Drafts",
      value: draftCount.toString(),
      icon: FileEdit,
      accent: false,
    },
    {
      label: "Views on page",
      value: totalViews.toLocaleString(),
      icon: Eye,
      accent: false,
    },
  ];

  // ─── Edit Blog ────────────────────────────────────────────────────────────
  function handleEdit(blog: Blog) {
    router.push(
      `/developer-dashboard/admin-portal/yappery/yaps/${blog.slug}/edit`,
    );
  }

  // ─── Toggle Publish Status ─────────────────────────────────────────────────
  async function togglePublish(blog: Blog) {
    const willPublish = !blog.isPublished;

    setUpdating(blog._id);

    try {
      const response = await apiFetch(`/blogs/${blog._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isPublished: willPublish,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success(
        willPublish ? "Blog published successfully" : "Blog unpublished",
      );

      await fetchBlogs();
    } catch {
      toast.error("Failed to update publication status");
    } finally {
      setUpdating(null);
    }
  }

  // ─── Delete Blog ──────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await apiFetch(`/blogs/${deleteTarget._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success("Blog deleted successfully");
      setDeleteTarget(null);

      // If the current page becomes empty, move to the previous page.
      if (blogs.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchBlogs();
      }
    } catch {
      toast.error("Failed to delete yap");
    } finally {
      setDeleting(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-neutral-950">
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-24 left-1/4 h-72 w-96 rounded-full bg-emerald-500/5 blur-[120px] dark:bg-emerald-500/10"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-white/40">
              Admin Portal
            </span>

            <span className="text-neutral-200 dark:text-white/20">/</span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-white/40">
              Yappery
            </span>

            <span className="text-neutral-200 dark:text-white/20">/</span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700 dark:text-white/80">
              Yaps
            </span>
          </div>

          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Yaps.
            <span className="ml-2 text-neutral-400 dark:text-white/40">
              Manage all.
            </span>
          </h1>

          <p className="max-w-md text-sm leading-6 text-neutral-500 dark:text-white/50">
            Create, edit, publish and manage all your articles on Yappery.
          </p>
        </header>

        {/* Statistics */}
        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-[16px] border border-neutral-200 bg-white p-4 shadow-xs shadow-neutral-900/4 dark:border-white/[0.07] dark:bg-white/2 dark:shadow-none"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-medium text-neutral-400 dark:text-white/40">
                  {label}
                </p>

                <Icon
                  className={cn(
                    "size-3.5",
                    accent
                      ? "text-emerald-500"
                      : "text-neutral-300 dark:text-white/25",
                  )}
                />
              </div>

              <p
                className={cn(
                  "text-[24px] font-semibold tracking-[-0.03em]",
                  accent
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-900 dark:text-white",
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-40 flex-1">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-400 dark:text-white/30" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search blogs..."
              className={cn(
                "h-9 w-full rounded-xl border pl-9 pr-9 text-[12.5px] outline-none transition-all",
                "border-neutral-200 bg-white text-neutral-800 shadow-xs shadow-neutral-900/4 placeholder:text-neutral-400",
                "focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10",
                "dark:border-white/[0.07] dark:bg-white/2 dark:text-white/80 dark:placeholder:text-white/30 dark:shadow-none dark:focus:border-white/20",
              )}
            />

            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Sorting */}
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => {
              setSortBy(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-36.25 rounded-xl border-neutral-200 bg-white text-[12px] shadow-xs dark:border-white/[0.07] dark:bg-white/2 dark:text-white/70">
              <ArrowUpDown className="mr-1 size-3.5 text-neutral-400" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="most-viewed">Most viewed</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Blog */}
          <button
            onClick={() =>
              router.push(
                "/developer-dashboard/admin-portal/yappery/yaps/new",
              )
            }
            className={cn(
              "group flex h-9 items-center gap-2 rounded-xl border px-4 text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.98]",
              "border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-100",
              "dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20",
            )}
          >
            <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
            Write a yap
          </button>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {(
            [
              { id: "all", label: "All blogs" },
              { id: "published", label: "Published" },
              { id: "drafts", label: "Drafts" },
            ] as { id: Filter; label: string }[]
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                "flex h-8 items-center gap-2 rounded-lg px-3 text-[11.5px] font-medium transition-all",
                filter === id
                  ? "border border-neutral-300 bg-neutral-900 text-white dark:border-white/20 dark:bg-white dark:text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 dark:border-white/[0.07] dark:bg-white/2 dark:text-white/50 dark:hover:bg-white/5",
              )}
            >
              {id === "published" && (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              )}

              {id === "drafts" && (
                <span className="size-1.5 rounded-full bg-amber-500" />
              )}

              {label}
            </button>
          ))}
        </div>

        {/* List Header */}
        <div className="mb-4 flex items-center gap-3">
          <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 dark:text-white/40">
            {filter === "published"
              ? "Published blogs"
              : filter === "drafts"
                ? "Drafts"
                : "All blogs"}
          </p>

          <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />

          <p className="whitespace-nowrap text-[10px] text-neutral-400 dark:text-white/30">
            {filteredBlogs.length} on this page
          </p>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-[16px] border border-neutral-200 bg-neutral-50 dark:border-white/[0.07] dark:bg-white/2"
              />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/[0.07] dark:bg-white/5">
              <BookOpen className="size-5 text-neutral-400 dark:text-white/30" />
            </div>

            <p className="text-sm font-medium text-neutral-500 dark:text-white/50">
              {search
                ? "No blogs match your search"
                : filter === "published"
                  ? "No published blogs yet"
                  : filter === "drafts"
                    ? "No drafts found"
                    : "No blogs yet"}
            </p>

            <p className="text-xs text-neutral-300 dark:text-white/25">
              {search
                ? "Try searching with a different keyword"
                : "Start writing your first article"}
            </p>

            {!search && filter !== "published" && (
              <button
                onClick={() =>
                  router.push(
                    "/developer-dashboard/admin-portal/yappery/yaps/new",
                  )
                }
                className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <Plus className="size-3.5" />
                Create your first yap
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onTogglePublish={togglePublish}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-white/[0.07]">
            <p className="text-[11px] text-neutral-400 dark:text-white/35">
              Showing page{" "}
              <span className="font-semibold text-neutral-700 dark:text-white/70">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-neutral-700 dark:text-white/70">
                {totalPages}
              </span>{" "}
              · {total} blogs
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/[0.07] dark:text-white/50 dark:hover:bg-white/5"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1,
                )
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center gap-1.5">
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-1 text-xs text-neutral-300">
                        ...
                      </span>
                    )}

                    <button
                      onClick={() => setPage(p)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg border text-[11px] font-medium transition-all",
                        page === p
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-white/[0.07] dark:text-white/50 dark:hover:bg-white/5",
                      )}
                    >
                      {p}
                    </button>
                  </div>
                ))}

              <button
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/[0.07] dark:text-white/50 dark:hover:bg-white/5"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className={cn(
            "max-w-sm rounded-[20px]",
            "border-neutral-200 bg-white dark:border-white/10 dark:bg-[#111]",
          )}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px] font-semibold text-neutral-900 dark:text-white">
              Delete blog?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-[12.5px] text-neutral-500 dark:text-white/50">
              <span className="font-semibold text-neutral-700 dark:text-white/80">
                {deleteTarget?.title}
              </span>{" "}
              will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-2 gap-2">
            <AlertDialogCancel
              disabled={deleting}
              className="h-9 rounded-xl border border-neutral-200 bg-white text-[12.5px] font-medium text-neutral-600 dark:border-white/8 dark:bg-transparent dark:text-white/50"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-[12.5px] font-semibold text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/[0.07] dark:text-red-400 dark:hover:bg-red-500/12"
            >
              {deleting && (
                <span className="size-3.5 animate-spin rounded-full border-2 border-red-300/30 border-t-red-500" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
