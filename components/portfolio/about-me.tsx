import Image from "next/image";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  MapPin,
  Sparkles,
  Download,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const facts = [
  {
    icon: Code2,
    label: "What I do",
    body: "Full-stack development, backend engineering, APIs and software architecture.",
    tags: ["Backend", "APIs", "Architecture"],
  },
  {
    icon: BriefcaseBusiness,
    label: "Currently focused on",
    body: "Artificial intelligence, machine learning, developer tools and distributed systems.",
    tags: ["AI / ML", "Dev tools", "Distributed systems"],
  },
  {
    icon: MapPin,
    label: "Based in",
    body: "Greater Noida, India",
    tags: [],
  },
];

export default function AboutSection() {
  return (
    <section id="about-me" className="border-b bg-background">
      <div className="mx-auto mb-20">

        {/* Section heading */}
        <div className="mb-12 max-w-2xl lg:mb-16">
          {/* Emerald rule line */}
          <div className="mb-5 h-0.75 w-8 rounded-full bg-emerald-500" />

          <Badge
            variant="secondary"
            className="mb-5 gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
          >
            <Sparkles className="size-3" />
            About me
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl lg:text-5xl">
            Building software with{" "}
            <span className="text-neutral-400 dark:text-neutral-500">
              curiosity and purpose.
            </span>
          </h2>
        </div>

        {/* Content grid */}
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">

          {/* ── Left: Image ── */}
          <div className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
              <Image
                src="/profile_photo.jpeg"
                alt="Profile photo"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover"
              />
              {/* Emerald corner accent */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 dark:ring-white/5" />
            </div>

            {/* Floating status card */}
            <div
              className={cn(
                "absolute -bottom-4 -right-3 sm:-right-5",
                "rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-sm",
                "dark:border-neutral-800 dark:bg-neutral-950/95",
                "shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
              )}
            >
              <div className="flex items-center gap-2.5">
                {/* Animated pulse dot */}
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Software Engineer
                </p>
              </div>
              <p className="mt-0.5 pl-5 text-xs text-neutral-400 dark:text-neutral-500">
                Building &amp; exploring
              </p>
            </div>
          </div>

          {/* ── Right: Content ── */}
          <div className="flex flex-col gap-8">

            {/* Bio */}
            <div className="space-y-4">
              <p className="text-lg leading-8 text-neutral-800 dark:text-neutral-200 sm:text-xl">
                I'm a software engineer who enjoys turning ideas into
                well-designed, reliable software. I work across the stack,
                with a particular interest in backend systems, developer
                tools, and artificial intelligence.
              </p>
              <p className="leading-7 text-neutral-500 dark:text-neutral-400">
                I like understanding how things work beneath the surface —
                from designing APIs and databases to experimenting with
                programming languages, machine learning systems, and
                developer-focused products.
              </p>
              <p className="leading-7 text-neutral-500 dark:text-neutral-400">
                I'm constantly building and experimenting with new ideas,
                using projects as a way to explore technologies and deepen
                my understanding of computer science.
              </p>
            </div>

            {/* Facts card */}
            <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/50">
              {facts.map(({ icon: Icon, label, body, tags }) => (
                <div key={label} className="flex items-start gap-4 p-5">
                  {/* Emerald icon box */}
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
                className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-white"
                asChild
              >
                <a href="#projects">
                  Explore my work
                  <ArrowUpRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Button>

              <Button
                variant="outline"
                className="rounded-full border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                asChild
              >
                <a href="/cv.pdf" download>
                  Download CV
                  <Download className="ml-1.5 size-4" />
                </a>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}