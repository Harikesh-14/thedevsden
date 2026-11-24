"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Atom,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronDown,
  Code,
  Coffee,
  Cpu,
  Database,
  Dumbbell,
  FlaskConical,
  Globe,
  GraduationCap,
  Heart,
  Image,
  Laptop,
  Lightbulb,
  LoaderCircle,
  Palette,
  Pencil,
  Plus,
  Search,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Types
interface ICategory {
  _id: string;
  name: string;
  slug: string;
  badgeText: string;
  description?: string;
  tags: string[];
  icon: string;
  accent: "primary" | "secondary" | "tertiary";
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryForm {
  name: string;
  slug: string;
  badgeText: string;
  description: string;
  tags: string;
  icon: string;
  accent: "primary" | "secondary" | "tertiary";
}

// Icon configuration
const ICON_OPTIONS: Record<string, LucideIcon> = {
  Activity,
  Atom,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Camera,
  Code,
  Coffee,
  Cpu,
  Database,
  Dumbbell,
  FlaskConical,
  Globe,
  GraduationCap,
  Heart,
  Image,
  Laptop,
  Lightbulb,
  Palette,
  Shield,
  Sparkles,
  Tag,
  Zap,
};

const DEFAULT_FORM: CategoryForm = {
  name: "",
  slug: "",
  badgeText: "",
  description: "",
  tags: "",
  icon: "Code",
  accent: "primary",
};

// Icon Picker
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const SelectedIcon = ICON_OPTIONS[value] || Code;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-between border-neutral-200 bg-white text-xs font-medium hover:bg-neutral-50 dark:border-white/10 dark:bg-[#191919] dark:text-neutral-200 dark:hover:bg-white/5"
        >
          <span className="flex items-center gap-2">
            <SelectedIcon size={16} className="text-emerald-500" />
            {value}
          </span>
          <ChevronDown size={14} className="text-neutral-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-70 border-neutral-200 bg-white p-0 dark:border-white/10 dark:bg-[#151515]"
        onWheel={(event) => event.stopPropagation()}
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search icons..."
            className="h-9 text-xs"
          />

          <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
            <CommandEmpty className="py-5 text-xs text-neutral-500">
              No icon found.
            </CommandEmpty>

            <CommandGroup>
              {Object.entries(ICON_OPTIONS).map(([name, Icon]) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className="cursor-pointer text-xs"
                >
                  <Icon size={15} className="mr-2 text-neutral-500" />
                  {name}

                  {value === name && (
                    <Check
                      size={14}
                      className="ml-auto text-emerald-500"
                    />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Slug Generator
function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Main Component
export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ICategory | null>(null);

  const [deleteCategory, setDeleteCategory] =
    useState<ICategory | null>(null);

  const [form, setForm] = useState<CategoryForm>(DEFAULT_FORM);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/yappery/categories");

      if (!response.ok) {
        throw new Error("Failed to fetch categories.");
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : data.categories ?? data.data ?? [];

      setCategories(items);
    } catch (error) {
      toast.error("Oops!", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Search
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(query) ||
        category.badgeText.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        category.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        )
      );
    });
  }, [categories, searchQuery]);

  // Dialog
  function openNewDialog() {
    setEditingCategory(null);
    setForm({ ...DEFAULT_FORM });
    setDialogOpen(true);
  }

  function openEditDialog(category: ICategory) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug || generateSlug(category.name),
      badgeText: category.badgeText,
      description: category.description || "",
      tags: category.tags?.join(", ") || "",
      icon: category.icon || "Code",
      accent: category.accent || "primary",
    });

    setDialogOpen(true);
  }

  function closeDialog(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      setEditingCategory(null);
      setForm({ ...DEFAULT_FORM });
    }
  }

  // Form Helpers
  function updateField<K extends keyof CategoryForm>(
    field: K,
    value: CategoryForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // Create / Update Category
  async function handleSave() {
    if (
      !form.name.trim() ||
      !form.slug.trim() ||
      !form.badgeText.trim()
    ) {
      toast.error("Please enter a category name, slug, and badge text.");
      return;
    }

    const tags = [
      ...new Set(
        form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      badgeText: form.badgeText.trim(),
      description: form.description.trim(),
      tags,
      icon: form.icon,
      accent: form.accent,
    };

    setSaving(true);

    try {
      const endpoint = editingCategory
        ? `/yappery/categories/${editingCategory._id}`
        : "/yappery/categories";

      const response = await apiFetch(endpoint, {
        method: editingCategory ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Unable to save the category."
        );
      }

      const savedCategory: ICategory = await response.json();

      if (editingCategory) {
        setCategories((previous) =>
          previous.map((category) =>
            category._id === savedCategory._id
              ? savedCategory
              : category
          )
        );
      } else {
        setCategories((previous) => [
          ...previous,
          savedCategory,
        ]);
      }

      closeDialog(false);

      toast.success(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete Category
  async function handleDelete() {
    if (!deleteCategory) return;

    setDeleting(true);

    try {
      const response = await apiFetch(
        `yappery/categories/${deleteCategory._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete the category.");
      }

      setCategories((previous) =>
        previous.filter(
          (category) => category._id !== deleteCategory._id
        )
      );

      setDeleteCategory(null);

      toast.success("Category deleted successfully.");
    } catch (error) {
      toast.error("Oops!", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
        closeButton: true,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-3 py-5 text-neutral-900 sm:px-5 dark:bg-[#090909] dark:text-[#ededed]">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />

            <span>Admin Portal</span>

            <span className="text-neutral-400 dark:text-neutral-700">
              /
            </span>

            <span>Yappery</span>

            <span className="text-neutral-400 dark:text-neutral-700">
              /
            </span>

            <span className="text-emerald-500">
              Categories
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Category Management
              </h1>

              <p className="mt-1 text-xs text-neutral-500">
                Organize your blog posts with categories, tags, and icons.
              </p>
            </div>

            <Button
              onClick={openNewDialog}
              className="h-9 gap-1.5 bg-emerald-500 px-3 text-xs font-semibold text-black hover:bg-emerald-400"
            >
              <Plus size={15} />
              New Category
            </Button>
          </div>
        </header>

        {/* Search & Stats */}
        <section className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-white/8 dark:bg-[#111111]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <Input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search categories, tags..."
                className="h-9 border-neutral-200 bg-white pl-9 text-xs dark:border-white/10 dark:bg-[#191919]"
              />
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 dark:border-white/8 dark:bg-[#191919]">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
                  Total Categories
                </p>

                <p className="text-sm font-bold tabular-nums text-emerald-500">
                  {categories.length}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => void fetchCategories()}
                disabled={loading}
                className="h-9 gap-1.5 border-neutral-200 bg-transparent px-3 text-xs dark:border-white/10"
              >
                <LoaderCircle
                  size={13}
                  className={loading ? "animate-spin" : "hidden"}
                />
                Refresh
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              All Categories
            </h2>

            <div className="h-px flex-1 bg-neutral-200 dark:bg-white/6" />

            <span className="text-xs text-neutral-500">
              {loading
                ? "Loading..."
                : `${filteredCategories.length} ${filteredCategories.length === 1
                  ? "category"
                  : "categories"
                }`}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-white/8 dark:bg-[#111111]">
              <LoaderCircle
                size={20}
                className="animate-spin text-emerald-400"
              />
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => {
                const Icon = ICON_OPTIONS[category.icon] || Code;

                return (
                  <article
                    key={category._id}
                    className="group flex min-w-0 flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition-colors hover:border-emerald-500/30 dark:border-white/8 dark:bg-[#111111]"
                  >
                    {/* Card Header */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/6">
                          <Icon
                            size={19}
                            className="text-emerald-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            {category.name}
                          </h3>

                          <p className="mt-0.5 text-[10px] text-neutral-500">
                            {category.icon}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                          className="h-7 w-7 text-neutral-500 hover:bg-emerald-500/10 hover:text-emerald-500"
                          aria-label="Edit category"
                        >
                          <Pencil size={13} />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCategory(category)}
                          className="h-7 w-7 text-neutral-500 hover:bg-red-500/10 hover:text-red-500"
                          aria-label="Delete category"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="mb-2">
                      <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {category.badgeText}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="min-h-10 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {category.description || "No description provided."}
                    </p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-neutral-200 pt-3 dark:border-white/6">
                      {category.tags?.length ? (
                        category.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[9px] font-medium text-neutral-600 dark:border-white/8 dark:bg-[#191919] dark:text-neutral-400"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-neutral-400">
                          No tags added
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center dark:border-white/8 dark:bg-[#0d0d0d]">
              <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-white/8 dark:bg-[#151515]">
                {searchQuery ? (
                  <Search size={16} className="text-neutral-500" />
                ) : (
                  <Tag size={16} className="text-neutral-500" />
                )}
              </div>

              <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-300">
                {searchQuery
                  ? "No categories found"
                  : "No categories yet"}
              </h3>

              <p className="mt-1 max-w-xs text-[11px] text-neutral-500">
                {searchQuery
                  ? "Try searching with a different name or tag."
                  : "Create your first category to start organizing your blog posts."}
              </p>

              {!searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={openNewDialog}
                  className="mt-3 h-8 gap-1.5 border-neutral-200 bg-transparent px-3 text-xs dark:border-white/10"
                >
                  <Plus size={14} />
                  Create Category
                </Button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-neutral-200 bg-white text-neutral-900 dark:border-white/10 dark:bg-[#111111] dark:text-neutral-100 sm:max-w-md">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-bold">
              {editingCategory ? "Edit category" : "New category"}
            </DialogTitle>

            <DialogDescription className="text-xs text-neutral-500">
              {editingCategory
                ? "Update the details of your category."
                : "Create a category to organize your blog content."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {/* Name */}
            <div className="space-y-1">
              <label
                htmlFor="category-name"
                className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
              >
                Category Name
              </label>

              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;

                  setForm((previous) => ({
                    ...previous,
                    name,
                    slug: generateSlug(name),
                  }));
                }}
                placeholder="e.g. Programming"
                maxLength={100}
                className="h-9 border-neutral-200 bg-white text-xs dark:border-white/10 dark:bg-[#191919]"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label
                htmlFor="category-slug"
                className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
              >
                Category Slug
              </label>

              <Input
                id="category-slug"
                value={form.slug}
                onChange={(event) =>
                  updateField("slug", generateSlug(event.target.value))
                }
                placeholder="e.g. programming"
                maxLength={120}
                className="h-9 border-neutral-200 bg-white font-mono text-xs dark:border-white/10 dark:bg-[#191919]"
              />

              <p className="text-[10px] text-neutral-500">
                Used in category URLs. You can customize it.
              </p>
            </div>

            {/* Badge */}
            <div className="space-y-1">
              <label
                htmlFor="category-badge"
                className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
              >
                Badge Text
              </label>

              <Input
                id="category-badge"
                value={form.badgeText}
                onChange={(event) =>
                  updateField("badgeText", event.target.value)
                }
                placeholder="e.g. TECH"
                maxLength={50}
                className="h-9 border-neutral-200 bg-white text-xs dark:border-white/10 dark:bg-[#191919]"
              />
            </div>

            {/* Icon */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                Category Icon
              </label>

              <IconPicker
                value={form.icon}
                onChange={(value) => updateField("icon", value)}
              />

              <p className="text-[10px] text-neutral-500">
                Select a Lucide icon for this category.
              </p>
            </div>

            {/* Accent */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                Category Accent
              </label>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      value: "primary",
                      label: "Primary",
                      color: "bg-indigo-500",
                    },
                    {
                      value: "secondary",
                      label: "Secondary",
                      color: "bg-cyan-500",
                    },
                    {
                      value: "tertiary",
                      label: "Tertiary",
                      color: "bg-emerald-500",
                    },
                  ] as const
                ).map((accent) => (
                  <button
                    key={accent.value}
                    type="button"
                    onClick={() => updateField("accent", accent.value)}
                    className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-colors ${form.accent === accent.value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-white/10 dark:bg-[#191919] dark:text-neutral-400"
                      }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${accent.color}`} />
                    {accent.label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-neutral-500">
                Determines the accent color used on your main website.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label
                htmlFor="category-description"
                className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
              >
                Description
              </label>

              <Textarea
                id="category-description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Describe what this category is about..."
                maxLength={300}
                rows={3}
                className="resize-none border-neutral-200 bg-white text-xs dark:border-white/10 dark:bg-[#191919]"
              />

              <p className="text-right text-[10px] text-neutral-500">
                {form.description.length}/300
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label
                htmlFor="category-tags"
                className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
              >
                Tags
              </label>

              <Input
                id="category-tags"
                value={form.tags}
                onChange={(event) =>
                  updateField("tags", event.target.value)
                }
                placeholder="javascript, react, nextjs"
                className="h-9 border-neutral-200 bg-white text-xs dark:border-white/10 dark:bg-[#191919]"
              />

              <p className="text-[10px] text-neutral-500">
                Separate multiple tags using commas.
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-white/8 dark:bg-[#191919]">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                Preview
              </p>

              <div className="flex items-center gap-2">
                {(() => {
                  const PreviewIcon = ICON_OPTIONS[form.icon] || Code;

                  return (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/6">
                      <PreviewIcon
                        size={17}
                        className="text-emerald-500"
                      />
                    </div>
                  );
                })()}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {form.name || "Category Name"}
                  </p>

                  <p className="mt-0.5 text-[10px] text-neutral-500">
                    {form.badgeText || "BADGE"}
                  </p>
                </div>

                <Sparkles
                  size={15}
                  className="shrink-0 text-emerald-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => closeDialog(false)}
              disabled={saving}
              className="h-8 border-neutral-200 bg-transparent text-xs dark:border-white/10"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={
                saving ||
                !form.name.trim() ||
                !form.slug.trim() ||
                !form.badgeText.trim()
              }
              className="h-8 gap-1.5 bg-emerald-500 px-3 text-xs font-semibold text-black hover:bg-emerald-400"
            >
              {saving && (
                <LoaderCircle size={13} className="animate-spin" />
              )}

              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteCategory(null);
        }}
      >
        <AlertDialogContent className="border-neutral-200 bg-white dark:border-white/10 dark:bg-[#111111]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold">
              Delete Category?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-xs leading-relaxed text-neutral-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                {deleteCategory?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="h-8 border-neutral-200 bg-transparent text-xs dark:border-white/10"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="h-8 gap-1.5 bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-600"
            >
              {deleting && (
                <LoaderCircle size={13} className="animate-spin" />
              )}
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}