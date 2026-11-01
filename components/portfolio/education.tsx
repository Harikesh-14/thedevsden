"use client"

import { useTranslations } from "next-intl"

import {
  Award,
  CalendarDays,
  GraduationCap,
  MapPin,
  School,
  Trophy,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function EducationSection() {
  const t = useTranslations("Education")

  const educationIcons = [GraduationCap, School]

  const education = t.raw("institutions") as {
    institution: string
    shortName: string
    degree: string
    specialization: string
    period: string
    type: "undergraduate" | "school"
    location: string
    result: string
    description: string
    highlights: string[]
    featured: boolean
  }[]

  return (
    <section
      id="education"
      className="relative overflow-hidden border-b bg-background"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-32 right-[5%] size-72 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-[8%] size-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-5 lg:px-8 lg:py-15">
        {/* Header */}
        <div className="mb-14">
          <div className="mb-5 h-0.75 w-8 rounded-full bg-emerald-500" />

          <Badge
            variant="secondary"
            className="mb-5 gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
          >
            <GraduationCap className="size-3" />
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

        {/* Education Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-4.75 hidden w-px bg-linear-to-b from-emerald-400 via-emerald-200 to-neutral-200 md:block dark:from-emerald-600 dark:via-emerald-900 dark:to-neutral-800" />

          <div className="space-y-8">
            {education.map((item, index) => {
              const Icon = educationIcons[index]

              return (
                <div key={item.institution} className="relative md:pl-15">
                  {/* Timeline node */}
                  <div
                    className={cn(
                      "absolute top-7 left-0 hidden size-10 items-center justify-center rounded-full shadow-sm md:flex",
                      item.featured
                        ? "border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950"
                        : "border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        item.featured
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
                      item.featured
                        ? "border-emerald-200/80 shadow-md dark:border-emerald-900/60"
                        : "border-neutral-200/70 shadow-sm dark:border-neutral-800/70"
                    )}
                  >
                    {/* Featured accent */}
                    {item.featured && (
                      <div className="h-0.75 w-full bg-linear-to-r from-emerald-400 via-emerald-500 to-emerald-300" />
                    )}

                    <CardContent className="p-6 sm:p-8">
                      {/* Top row */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        {/* Institution */}
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                              item.featured
                                ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60"
                                : "border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50"
                            )}
                          >
                            <Icon
                              className={cn(
                                "size-5",
                                item.featured
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-neutral-400 dark:text-neutral-500"
                              )}
                            />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                {item.institution}
                              </h3>

                              {item.featured && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                                  <span className="size-1.5 rounded-full bg-emerald-500" />
                                  {t("graduated")}
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
                              {item.shortName} · {t(item.type)}
                            </p>
                          </div>
                        </div>

                        {/* Period */}
                        <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400">
                          <CalendarDays className="size-3.5" />
                          {item.period}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="my-6 h-px bg-neutral-100 dark:bg-neutral-800" />

                      {/* Degree + Academic Highlights */}
                      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                        <div>
                          <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                            {t("qualification")}
                          </p>

                          <h4 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
                            {item.degree}
                          </h4>

                          <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {item.specialization}
                          </p>

                          <p className="mt-3 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
                            {item.description}
                          </p>
                        </div>

                        {/* Academic highlights */}
                        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/80 p-5 dark:border-neutral-700/50 dark:bg-neutral-800/30">
                          <div className="flex items-center gap-2">
                            <Trophy className="size-3.5 text-emerald-600 dark:text-emerald-400" />

                            <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                              {t("highlights")}
                            </p>
                          </div>

                          <div className="mt-4 space-y-2.5">
                            {item.highlights.map((highlight) => (
                              <div
                                key={highlight}
                                className="flex items-start gap-2.5"
                              >
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />

                                <span className="text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                                  {highlight}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Metadata footer */}
                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-neutral-100 pt-5 dark:border-neutral-800">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                          <MapPin className="size-3.5" />
                          {item.location}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <Award className="size-3.5" />
                          {item.result}
                        </div>
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