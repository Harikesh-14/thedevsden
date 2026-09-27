import {
  Award,
  CalendarDays,
  GraduationCap,
  MapPin,
  School,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const education = [
  {
    institution: "SRM University",
    shortName: "SRMIST",
    degree: "B.Tech in Computer Science & Engineering",
    specialization: "Specialization in Software Engineering",
    period: "August 2021 - June 2025",
    type: "Undergraduate",
    location: "Kattankulathur, Tamil Nadu, India",
    result: "8.89 CGPA",
    description:
      "Completed my undergraduate degree in Computer Science & Engineering with a specialization in Software Engineering, building a strong foundation across software development, computer science, and engineering principles.",
    highlights: [
      "B.Tech — Computer Science & Engineering",
      "Software Engineering Specialization",
      "Cumulative CGPA: 8.89",
    ],
    icon: GraduationCap,
    featured: true,
  },
  {
    institution: "R.D. Rajpal School",
    shortName: "CBSE",
    degree: "Senior Secondary Education",
    specialization: "KG - Class 12",
    period: "2008 - 2021",
    type: "School",
    location: "Dwarka Sector-9, New Delhi",
    result: "91.8% in Class 12",
    description:
      "Completed schooling from Kindergarten through Class 12 under the CBSE curriculum, with a consistent academic record and no backlogs.",
    highlights: [
      "Class 12: 91.8% — CBSE",
      "Class 10: 84.6% — CBSE",
    ],
    icon: School,
    featured: false,
  },
];

export default function EducationSection() {
  return (
    <section
      id="education"
      className="relative overflow-hidden border-b bg-background"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[5%] top-32 size-72 rounded-full bg-emerald-500/5 blur-3xl" />
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
            Education
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl lg:text-5xl">
            Where I{" "}
            <span className="text-neutral-400 dark:text-neutral-500">
              learned.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-500 dark:text-neutral-400 sm:text-lg">
            My academic journey from school to software engineering, shaped by
            a strong foundation in computer science and a continued interest
            in building things with technology.
          </p>
        </div>

        {/* Education Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute bottom-0 left-4.75 top-0 hidden w-px bg-linear-to-b from-emerald-400 via-emerald-200 to-neutral-200 dark:from-emerald-600 dark:via-emerald-900 dark:to-neutral-800 md:block" />

          <div className="space-y-8">
            {education.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.institution} className="relative md:pl-15">
                  {/* Timeline node */}
                  <div
                    className={cn(
                      "absolute left-0 top-7 hidden size-10 items-center justify-center rounded-full shadow-sm md:flex",
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
                                  Graduated
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
                              {item.shortName} · {item.type}
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
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                            Qualification
                          </p>

                          <h4 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
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

                            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                              Academic highlights
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}