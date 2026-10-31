import Image from "next/image"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  MapPin,
  Sparkles,
  Calendar1,
} from "lucide-react"

import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function AboutSection() {
  const t = await getTranslations("AboutMe")

  const descriptions = t.raw("description") as string[]
  const imageMetadata = t.raw("imageMetadata") as string[]

  const facts = [
    {
      icon: Calendar1,
      label: t("tableData.rowOne.heading"),
      body: t("tableData.rowOne.description"),
      tags: [] as string[],
    },
    {
      icon: Code2,
      label: t("tableData.rowTwo.heading"),
      body: t("tableData.rowTwo.description"),
      tags: t.raw("tableData.rowTwo.tags") as string[],
    },
    {
      icon: BriefcaseBusiness,
      label: t("tableData.rowThree.heading"),
      body: t("tableData.rowThree.description"),
      tags: t.raw("tableData.rowThree.tags") as string[],
    },
    {
      icon: MapPin,
      label: t("tableData.rowFour.heading"),
      body: t("tableData.rowFour.description"),
      tags: [] as string[],
    },
  ]

  return (
    <section id="about-me" className="border-b bg-background">
      <div className="mx-auto mb-20">
        {/* Section heading */}
        <div className="mb-12 max-w-2xl lg:mb-16">
          <div className="mb-5 h-0.75 w-8 rounded-full bg-emerald-500" />

          <Badge
            variant="secondary"
            className="mb-5 gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
          >
            <Sparkles className="size-3" />
            {t("title")}
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-50">
            {t("subheading")}
          </h2>
        </div>

        {/* Content grid */}
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">

          {/* Left: Image */}
          <div className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
              <Image
                src="/profile_photo.jpeg"
                alt={imageMetadata[0]}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover"
              />

              <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 ring-inset dark:ring-white/5" />
            </div>

            {/* Floating status card */}
            <div
              className={cn(
                "absolute -right-3 -bottom-4 sm:-right-5",
                "rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-sm",
                "dark:border-neutral-800 dark:bg-neutral-950/95",
                "shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>

                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {imageMetadata[0]}
                </p>
              </div>

              <p className="mt-0.5 pl-5 text-xs text-neutral-400 dark:text-neutral-500">
                {imageMetadata[1]}
              </p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col gap-8">

            {/* Bio */}
            <div className="space-y-3">
              <p className="text-lg leading-8 text-neutral-800 sm:text-xl dark:text-neutral-200">
                {descriptions[0]}
              </p>

              <p className="leading-7 text-neutral-500 dark:text-neutral-400">
                {descriptions[1]}
              </p>

              <p className="leading-7 text-neutral-500 dark:text-neutral-400">
                {descriptions[2]}
              </p>
            </div>

            {/* Facts card */}
            <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/50">
              {facts.map(({ icon: Icon, label, body, tags }) => (
                <div key={label} className="flex items-start gap-4 p-5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60">
                    <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {label}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                      {body}
                    </p>

                    {tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-400"
                asChild
              >
                <a href="#projects">
                  {t("buttonOne")}
                  <ArrowUpRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Button>

              <Button
                variant="outline"
                className="cursor-not-allowed rounded-full border-neutral-200 bg-neutral-50 text-neutral-400 opacity-90 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500"
                disabled
                title="My resume is still being prepared. Check back soon!"
              >
                {t("buttonTwo")}
                <Calendar1 className="ml-1.5 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
