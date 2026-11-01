import {
  BrainCircuit,
  Braces,
  Code2,
  Database,
  Globe2,
  Layers3,
  Server,
  Terminal,
  Wrench,
  TestTube2,
} from "lucide-react"

import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const skillIcons = [
  Server,
  Globe2,
  Database,
  Braces,
  BrainCircuit,
  Terminal,
  TestTube2,
] as const

export default async function SkillSection() {
  const t = await getTranslations("Skills")

  const skillGroups = t.raw("skillGroups") as {
    title: string
    description: string
    skills: string[]
  }[]

  const coreSkills = t.raw("coreSkills") as string[]

  return (
    <section
      id="skills"
      className="relative overflow-hidden border-b bg-background"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-[10%] size-72 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute right-[5%] bottom-20 size-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10 lg:py-32">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mx-auto mb-5 h-0.75 w-8 rounded-full bg-emerald-500" />

          <Badge
            variant="secondary"
            className="mb-5 gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
          >
            <Layers3 className="size-3" />
            {t("title")}
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-50">
            {t("subheading")}{" "}
            <span className="text-neutral-400 dark:text-neutral-500">
              {t("subheadingHighlight")}
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-500 sm:text-lg dark:text-neutral-400">
            {t("description")}
          </p>
        </div>

        {/* Core capabilities */}
        <Card className="mb-6 overflow-hidden rounded-3xl border-neutral-200/70 bg-white/60 shadow-sm backdrop-blur-xl dark:border-neutral-800/70 dark:bg-neutral-900/40">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xs shrink-0">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60">
                    <Code2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("coreTitle")}
                  </h3>
                </div>
                <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {t("coreDescription")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
                {coreSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill grid */}
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, index) => {
            const Icon = skillIcons[index]

            return (
              <Card
                key={group.title}
                className="group relative overflow-hidden rounded-3xl border-neutral-200/70 bg-white/50 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-md dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:hover:border-emerald-900/60"
              >
                <CardContent className="p-6">
                  <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-emerald-500/0 blur-2xl transition-all duration-500 group-hover:bg-emerald-500/8 dark:group-hover:bg-emerald-400/6" />

                  <div className="relative">
                    <div className="mb-5 flex size-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/60">
                      <Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                      {group.title}
                    </h3>

                    <p className="mt-1.5 min-h-10 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                      {group.description}
                    </p>

                    {/* Skill tags */}
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {group.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer statement */}
        <div className="mt-14 flex items-center justify-center gap-3 text-sm text-neutral-400 dark:text-neutral-500">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <Wrench className="size-3.5" />
          <span>{t("footer")}</span>
          <Wrench className="size-3.5" />
          <span className="size-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>
    </section>
  )
}