import {
  ArrowUpRight,
  GitBranch,
  Inbox,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "ranjansinhaharikesh@gmail.com",
    href: "mailto:ranjansinhaharikesh@gmail.com",
  },
  {
    icon: GitBranch,
    label: "GitHub (main)",
    value: "github.com/Harikesh-14",
    href: "https://github.com/Harikesh-14",
  },
  {
    icon: GitBranch,
    label: "GitHub (secondary)",
    value: "github.com/harikeshranjan",
    href: "https://github.com/harikeshranjan",
  },
  {
    icon: Inbox,
    label: "LinkedIn",
    value: "linkedin.com/in/harikeshranjansinha",
    href: "https://linkedin.com/in/harikeshranjansinha",
  },
];

export default function ContactSection() {
  return (
    <main id="contact-me" className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-14 max-w-3xl lg:mb-20">
          {/* Emerald rule */}
          <div className="mb-5 h-0.75 w-8 rounded-full bg-emerald-500" />

          <Badge
            variant="secondary"
            className="mb-5 gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
          >
            <Sparkles className="size-3" />
            Get in touch
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl lg:text-6xl">
            Let's build something{" "}
            <span className="text-neutral-400 dark:text-neutral-500">
              interesting.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-500 dark:text-neutral-400 sm:text-xl">
            Have an idea, a project, or just want to talk about software,
            artificial intelligence, or some ridiculously interesting tech
            rabbit hole? My inbox is open.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

          {/* ───────────── Left ───────────── */}
          <div className="flex flex-col gap-8">

            {/* Intro card */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-7">
              <div className="mb-5 flex size-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60">
                <MessageCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                What can we talk about?
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                I'm always interested in interesting ideas and challenging
                technical problems. Feel free to reach out about projects,
                collaboration, software engineering, or anything worth
                discussing.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Software Engineering",
                  "AI / ML",
                  "Backend Systems",
                  "Developer Tools",
                  "Open Source",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60">
                <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Based in
                </p>

                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Greater Noida, India
                </p>
              </div>
            </div>

            {/* Contact methods */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
              {contactMethods.map(
                ({ icon: Icon, label, value, href }, index) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className={`group flex items-center gap-4 p-5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                      index !== contactMethods.length - 1
                        ? "border-b border-neutral-100 dark:border-neutral-800"
                        : ""
                    }`}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60">
                      <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                        {label}
                      </p>

                      <p className="mt-0.5 truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {value}
                      </p>
                    </div>

                    <ArrowUpRight className="size-4 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-neutral-600" />
                  </a>
                )
              )}
            </div>
          </div>

          {/* ───────────── Right: Contact Form ───────────── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:border-neutral-800 dark:bg-neutral-900/50 dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] sm:p-8 lg:p-10">

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Send me a message
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                Tell me a little about yourself and what you're working on.
              </p>
            </div>

            <form className="space-y-5">

              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What's on your mind?"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Tell me about your idea, project, or question..."
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                Send message
                <ArrowUpRight className="ml-1.5 size-4" />
              </Button>

              <p className="text-center text-xs text-neutral-400 dark:text-neutral-600">
                I'll get back to you as soon as I can.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}