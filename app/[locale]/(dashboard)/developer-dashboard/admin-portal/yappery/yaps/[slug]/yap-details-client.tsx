"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Tag,
  Trash2,
  Globe,
  Lock,
  RefreshCw,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface Yap {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
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
}

interface YapDetailsClientProps {
  slug: string;
}

function formatDate(date?: string) {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getCategoryName(category: Category | string) {
  if (typeof category === "string") return category;
  return category?.name ?? "Uncategorized";
}

export default function YapDetailsClient({
  slug,
}: YapDetailsClientProps) {
  const router = useRouter();

  const [yap, setYap] = useState<Yap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchYap = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiFetch(
        `/blogs/${encodeURIComponent(slug)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch yap.");
      }

      const result = await response.json();

      if (!result?._id) {
        throw new Error("Yap not found.");
      }

      setYap(result as Yap);
    } catch (error) {
      console.error("Failed to fetch yap:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load yap."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchYap();
  }, [fetchYap]);

  const togglePublication = async () => {
    if (!yap) return;

    const nextStatus = !yap.isPublished;

    try {
      setUpdating(true);

      await apiFetch(`/blogs/${yap._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isPublished: nextStatus,
        }),
      });

      setYap((current) =>
        current
          ? {
              ...current,
              isPublished: nextStatus,
              publishedAt: nextStatus
                ? current.publishedAt || new Date().toISOString()
                : current.publishedAt,
            }
          : current
      );

      toast.success(
        nextStatus ? "Yap published successfully!" : "Yap moved to drafts."
      );
    } catch (error) {
      console.error("Failed to update publication status:", error);
      toast.error("Unable to update publication status.");
    } finally {
      setUpdating(false);
    }
  };

  const deleteYap = async () => {
    if (!yap) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${yap.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await apiFetch(`/blogs/${yap._id}`, {
        method: "DELETE",
      });

      toast.success("Yap deleted successfully.");
      router.push("/developer-dashboard/admin-portal/yappery/yaps");
    } catch (error) {
      console.error("Failed to delete yap:", error);
      toast.error("Unable to delete this yap.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          </div>
          <p className="text-xs text-muted-foreground">Loading your yap...</p>
        </div>
      </div>
    );
  }

  if (!yap) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>

        <h2 className="text-base font-semibold">Yap not found</h2>

        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
          We couldn&apos;t find a yap with this slug. It may have been deleted
          or the URL might be incorrect.
        </p>

        <Link
          href="/developer-dashboard/admin-portal/yappery/yaps"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Yaps
        </Link>
      </div>
    );
  }

  const categoryName = getCategoryName(yap.category);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-10">
      {/* Header actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/developer-dashboard/admin-portal/yappery/yaps"
          className="group inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Yaps
        </Link>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={fetchYap}
            disabled={loading}
            aria-label="Refresh"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href={`/developer-dashboard/admin-portal/yappery/yaps/${yap.slug}/edit`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium transition hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>

          <button
            onClick={togglePublication}
            disabled={updating}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition disabled:opacity-50 ${
              yap.isPublished
                ? "border border-border hover:bg-muted"
                : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
            }`}
          >
            {updating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : yap.isPublished ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}

            {yap.isPublished ? "Unpublish" : "Publish"}
          </button>

          <button
            onClick={deleteYap}
            disabled={deleting}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-500/20 px-2.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Yap overview */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500/0" />

        {yap.coverImage && (
          <div className="relative aspect-21/9 w-full overflow-hidden bg-muted">
            <img
              src={yap.coverImage}
              alt={yap.title}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="space-y-5 p-4 sm:p-6">
          {/* Status and category */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                yap.isPublished
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  yap.isPublished ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {yap.isPublished ? "Published" : "Draft"}
            </span>

            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-500">
              {categoryName}
            </span>

            {yap.isPublished && yap.publishedAt && (
              <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:inline-flex">
                <Globe className="h-3 w-3" />
                Published {formatDate(yap.publishedAt)}
              </span>
            )}
          </div>

          {/* Title and excerpt */}
          <div className="max-w-3xl space-y-2.5">
            <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl">
              {yap.title}
            </h1>

            {yap.excerpt && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {yap.excerpt}
              </p>
            )}
          </div>

          {/* Tags */}
          {yap.tags?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="mr-0.5 h-3.5 w-3.5 text-muted-foreground" />

              {yap.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground transition hover:border-indigo-500/30 hover:text-indigo-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetadataItem
              icon={<Eye className="h-3.5 w-3.5" />}
              label="Total Views"
              value={yap.viewsCount.toLocaleString()}
            />

            <MetadataItem
              icon={<Clock3 className="h-3.5 w-3.5" />}
              label="Reading Time"
              value={`${yap.readingTime} min`}
            />

            <MetadataItem
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="Created"
              value={formatDate(yap.createdAt)}
            />

            <MetadataItem
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              label="Last Updated"
              value={formatDate(yap.updatedAt)}
            />
          </div>

          {yap.isPublished && yap.publishedAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:hidden">
              <Globe className="h-3 w-3" />
              Published {formatDate(yap.publishedAt)}
            </div>
          )}
        </div>
      </div>

      {/* Markdown content */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-none">
                Yap Content
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Rendered Markdown preview
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            Markdown
          </span>
        </div>

        <article className="px-4 py-6 sm:px-6 sm:py-8">
          <div
            className="prose prose-sm prose-slate max-w-none wrap-break-word dark:prose-invert
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
            prose-p:leading-7 prose-a:text-indigo-500 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-indigo-500 prose-blockquote:text-muted-foreground
            prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5
            prose-code:text-xs prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
            prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-border
            prose-pre:bg-muted/60 prose-pre:text-foreground prose-pre:text-xs
            prose-img:rounded-lg prose-img:border prose-img:border-border
            prose-table:block prose-table:overflow-x-auto prose-table:text-xs
            prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-1.5
            prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-1.5
            prose-hr:border-border"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                    <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
                  </a>
                ),
              }}
            >
              {yap.content}
            </ReactMarkdown>
          </div>
        </article>
      </section>

      {/* Bottom information */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Yap slug
          </p>
          <p className="mt-0.5 break-all font-mono text-xs">{yap.slug}</p>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(yap.slug);
            toast.success("Slug copied to clipboard.");
          }}
          className="inline-flex h-8 w-fit shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium transition hover:bg-muted"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy slug
        </button>
      </div>
    </div>
  );
}

function MetadataItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>

      <p className="wrap-break-word text-xs font-medium">{value}</p>
    </div>
  );
}