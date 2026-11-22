"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
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
}

interface EditYapClientProps {
  slug: string;
}

type EditorTab = "write" | "preview";

export default function EditYapClient({ slug }: EditYapClientProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  const [yapId, setYapId] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [editorTab, setEditorTab] = useState<EditorTab>("write");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [yapResponse, categoryResponse] = await Promise.all([
        apiFetch(`/blogs/${encodeURIComponent(slug)}`),
        apiFetch("/yappery/categories"),
      ]);

      if (!yapResponse.ok) {
        throw new Error("Unable to fetch yap.");
      }

      if (!categoryResponse.ok) {
        throw new Error("Unable to fetch categories.");
      }

      const [yapPayload, categoryPayload] = await Promise.all([
        yapResponse.json(),
        categoryResponse.json(),
      ]);

      const yap: Yap = yapPayload?.data ?? yapPayload;
      const categoryList: Category[] =
        categoryPayload?.data ?? categoryPayload;

      if (!yap?._id) {
        throw new Error("Yap not found.");
      }

      setYapId(yap._id);
      setOriginalSlug(yap.slug);

      setTitle(yap.title ?? "");
      setExcerpt(yap.excerpt ?? "");
      setContent(yap.content ?? "");

      setCategory(
        typeof yap.category === "string"
          ? yap.category
          : yap.category?._id ?? ""
      );

      setTags(yap.tags ?? []);
      setCoverImage(yap.coverImage ?? "");
      setIsPublished(yap.isPublished ?? false);

      setCategories(
        Array.isArray(categoryList) ? categoryList : []
      );
    } catch (error) {
      console.error("Failed to load edit page:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading the yap."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTag = (value: string) => {
    const newTag = value.trim().toLowerCase();

    if (!newTag) return;

    if (tags.includes(newTag)) {
      toast.error("This tag has already been added.");
      return;
    }

    setTags((previous) => [...previous, newTag]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((previous) =>
      previous.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
    }

    if (event.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }

    if (!content.trim()) {
      toast.error("Please write some content.");
      return;
    }

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const response = await apiFetch(`/blogs/${yapId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim(),
          content,
          category,
          tags,
          coverImage: coverImage.trim() || undefined,
          isPublished,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);

        throw new Error(
          errorPayload?.message || "Failed to update yap."
        );
      }

      const payload = await response.json().catch(() => null);
      const updatedYap = payload?.data ?? payload;

      toast.success("Yap updated successfully!");

      // If the title changed, the backend may have generated a new slug.
      const updatedSlug = updatedYap?.slug || originalSlug;

      router.push(
        `/developer-dashboard/admin-portal/yappery/yaps/${updatedSlug}`
      );
      router.refresh();
    } catch (error) {
      console.error("Failed to update yap:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the yap."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">
            Loading yap editor...
          </p>
        </div>
      </div>
    );
  }

  if (!yapId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <FileText className="mb-4 h-10 w-10 text-muted-foreground" />

        <h2 className="text-xl font-semibold">Yap not found</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find the yap you're trying to edit.
        </p>

        <Link
          href="/developer-dashboard/admin-portal/yappery/yaps"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Yaps
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-6xl space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href={`/developer-dashboard/admin-portal/yappery/yaps/${originalSlug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Yap
          </Link>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Edit Yap
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Make changes to your existing yap.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main editor */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic information */}
          <section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div>
              <h2 className="font-semibold">Basic Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the title and description of your yap.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>

              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={150}
                required
                placeholder="Give your yap a catchy title..."
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />

              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {title.length}/150
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="excerpt" className="text-sm font-medium">
                Excerpt
              </label>

              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Write a short description of your yap..."
                className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />

              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {excerpt.length}/300
                </span>
              </div>
            </div>
          </section>

          {/* Content editor */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-5 sm:px-6">
              <h2 className="font-semibold">Content Editor</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit your yap using Markdown.
              </p>
            </div>

            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    editorTab === "write"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Write
                </button>

                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    editorTab === "preview"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
              </div>

              <span className="text-xs text-muted-foreground">
                Markdown supported
              </span>
            </div>

            <div className="min-h-112.5">
              {editorTab === "write" ? (
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  required
                  placeholder="Start writing your yap..."
                  spellCheck
                  className="min-h-112.5 w-full resize-y bg-background p-5 font-mono text-sm leading-7 outline-none placeholder:text-muted-foreground sm:p-6"
                />
              ) : (
                <article className="prose prose-slate max-w-none wrap-break-word p-5 dark:prose-invert sm:p-6
                  prose-headings:font-semibold prose-headings:tracking-tight
                  prose-p:leading-8 prose-a:text-indigo-500
                  prose-blockquote:border-l-indigo-500
                  prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5
                  prose-code:before:content-none prose-code:after:content-none
                  prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-muted
                  prose-img:rounded-xl prose-table:block prose-table:overflow-x-auto
                  prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2
                  prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2"
                >
                  {content.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">
                      Nothing to preview yet. Start writing your yap!
                    </p>
                  )}
                </article>
              )}
            </div>

            <div className="border-t border-border px-5 py-3 sm:px-6">
              <p className="text-xs text-muted-foreground">
                {content.length.toLocaleString()} characters
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Publication */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <h2 className="font-semibold">Visibility</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Control who can read this yap.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPublished((previous) => !previous)}
              className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left transition hover:bg-muted/50"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isPublished ? "Published" : "Draft"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPublished
                    ? "Your yap is publicly visible."
                    : "Your yap is not publicly visible."}
                </p>
              </div>

              <span
                className={`relative h-6 w-11 rounded-full transition ${
                  isPublished ? "bg-indigo-600" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    isPublished ? "left-6" : "left-1"
                  }`}
                />
              </span>
            </button>
          </section>

          {/* Category */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <h2 className="font-semibold">Category</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose where your yap belongs.
              </p>
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            >
              <option value="" disabled>
                Select a category
              </option>

              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </section>

          {/* Tags */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <h2 className="flex items-center gap-2 font-semibold">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Tags
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add relevant tags to your yap.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() => addTag(tagInput)}
                disabled={!tagInput.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-xs"
                >
                  #{tag}

                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-muted-foreground transition hover:text-red-500"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No tags added yet.
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add a tag.
            </p>
          </section>

          {/* Cover image */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <h2 className="flex items-center gap-2 font-semibold">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Cover Image
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a URL for your yap's cover image.
              </p>
            </div>

            <input
              type="url"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            />

            {coverImage.trim() && (
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="aspect-video w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />

                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white transition hover:bg-black/80"
                  aria-label="Remove cover image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>

          {/* Existing information */}
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Yap Information</h2>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current slug</p>
              <p className="break-all font-mono text-xs">{originalSlug}</p>
            </div>
          </section>
        </aside>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/developer-dashboard/admin-portal/yappery/yaps/${originalSlug}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}