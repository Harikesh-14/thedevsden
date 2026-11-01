"use client"

import {
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  Code2,
  Globe2,
  MapPin,
  TestTube2,
} from "lucide-react"

import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const experienceIcons = [Code2, Globe2]
const experienceMetaIcons = [TestTube2, null]

type Experience = {
  company: string
  shortName: string
  role: string
  period: string
  type: "fullTime" | "internship"
  location: string
  description: string
  technologies: string[]
  highlightedTechs: string[]
  featured: boolean
  meta: string | null
}

export default function ExperiencesSection() {
  const t = useTranslations("Experiences")

  const experiences = t.raw("positions") as Experience[]

  return (
    <section
      id="experiences"
      className="relative overflow-hidden border-b bg-background"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-32 left-[5%] size-72 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute right-[8%] bottom-20 size-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-5 lg:px-8 lg:py-15">

        {/* Header */}
        <div className="mb-14">
          <div className="mb-5 h-0.75 w-8 rounded-full bg-emerald-500" />

          <Badge
            variant="secondary"
            className="mb-5 gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
          >
            <BriefcaseBusiness className="size-3" />
            {t("badge")}
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-50">
            {t("heading")}{" "}
            <span className="text-neutral-400 dark:text-neutral-500">
              {t("headingHighlight")}
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-500 sm:text-lg dark:text-neutral-400">
            {t("description")}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">

          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-4.75 hidden w-px bg-linear-to-b from-emerald-400 via-emerald-200 to-neutral-200 md:block dark:from-emerald-600 dark:via-emerald-900 dark:to-neutral-800" />

          <div className="space-y-8">
            {experiences.map((experience, index) => {
              const Icon = experienceIcons[index] ?? Code2
              const MetaIcon = experienceMetaIcons[index]

              return (
                <div
                  key={experience.company}
                  className="relative md:pl-15"
                >

                  {/* Timeline node */}
                  <div
                    className={cn(
                      "absolute top-7 left-0 hidden size-10 items-center justify-center rounded-full shadow-sm md:flex",
                      experience.featured
                        ? "border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950"
                        : "border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        experience.featured
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-neutral-400 dark:text-neutral-500"
                      )}
                    />
                  </div>

                  <Card
                    className={cn(
                      "group relative overflow-hidden rounded-3xl backdrop-blur-xl transition-all duration-300",
                      "bg-white/60 dark:bg-neutral-900/50",
                      "hover:-translate-y-1 hover:shadow-lg",
                      experience.featured
                        ? "border-emerald-200/80 shadow-md dark:border-emerald-900/60"
                        : "border-neutral-200/70 shadow-sm dark:border-neutral-800/70"
                    )}
                  >

                    {/* Featured accent */}
                    {experience.featured && (
                      <div className="h-0.75 w-full bg-linear-to-r from-emerald-400 via-emerald-500 to-emerald-300" />
                    )}

                    <CardContent className="p-6 sm:p-8">

                      {/* Top row */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        {/* Company identity */}
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                              experience.featured
                                ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60"
                                : "border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50"
                            )}
                          >
                            <Icon
                              className={cn(
                                "size-5",
                                experience.featured
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-neutral-400 dark:text-neutral-500"
                              )}
                            />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                {experience.company}
                              </h3>

                              {experience.featured && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                                  {t("current")}
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
                              {experience.shortName} ·{" "}
                              {t(`employmentTypes.${experience.type}`)}
                            </p>
                          </div>
                        </div>

                        {/* Period */}
                        <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400">
                          <CalendarDays className="size-3.5" />
                          {experience.period}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="my-6 h-px bg-neutral-100 dark:bg-neutral-800" />

                      {/* Role + Focus areas */}
                      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">

                        {/* Role */}
                        <div>
                          <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                            {t("role")}
                          </p>

                          <h4 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
                            {experience.role}
                          </h4>

                          <p className="mt-3 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
                            {experience.description}
                          </p>
                        </div>

                        {/* Focus areas */}
                        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/80 p-5 dark:border-neutral-700/50 dark:bg-neutral-800/30">
                          <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                            {t("focusAreas")}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {experience.technologies.map((tech) => {
                              const isHighlighted =
                                experience.highlightedTechs.includes(tech)

                              return (
                                <span
                                  key={tech}
                                  className={cn(
                                    "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                                    isHighlighted
                                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
                                      : "border border-neutral-200 bg-white text-neutral-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                                  )}
                                >
                                  {tech}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Metadata footer */}
                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-neutral-100 pt-5 dark:border-neutral-800">

                        {/* Employment type */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                          <Clock className="size-3.5" />
                          {t(`employmentTypes.${experience.type}`)}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                          <MapPin className="size-3.5" />
                          {experience.location}
                        </div>

                        {/* Additional metadata */}
                        {MetaIcon && experience.meta && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <MetaIcon className="size-3.5" />
                            {experience.meta}
                          </div>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}