import { MessageCircle, MessageSquareQuote, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { PortalLink } from "@/lib/admin-portal-links"
import { PortalCard } from "@/components/developer-dashboard/portal-card"

const portalLinks: PortalLink[] = [
  {
    title: "Thought of the day",
    description: "Manage daily quotes shown on the developer dashboard welcome screen.",
    href: "/developer-dashboard/admin-portal/thedevsden/thought-of-the-day",
    icon: MessageSquareQuote,
  },
  {
    title: "Contact me",
    description: "Viewing all the messages sent to me via the portfolio mode of the 'thedevsden'",
    href: "/developer-dashboard/admin-portal/thedevsden/contact-me",
    icon: MessageCircle
  }
]

// Coming soon placeholder
function ComingSoonCard() {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-[18px] border border-dashed p-5",
      "border-neutral-200 bg-neutral-50/50",
      "dark:border-white/6 dark:bg-white/1.5",
    )}>
      <div className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl",
        "border border-neutral-200 bg-white text-neutral-300",
        "dark:border-white/[0.07] dark:bg-white/3 dark:text-white/20",
      )}>
        <Plus className="size-4" />
      </div>
      <p className="text-[12px] italic text-neutral-400 dark:text-white/20">
        More links coming soon…
      </p>
    </div>
  )
}

export default function AdminPortalTheDevsDen() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-transparent">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-16 left-1/4 h-56 w-80 rounded-full blur-3xl
          bg-emerald-400/20 dark:bg-emerald-500/9"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-16 right-1/4 h-52 w-72 rounded-full blur-3xl
          bg-emerald-400/15 dark:bg-emerald-500/6"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <span className={cn(
              "size-2 rounded-full",
              "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
              "dark:bg-emerald-400 dark:shadow-[0_0_12px_rgba(52,211,153,0.8)]",
            )} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
              text-neutral-400 dark:text-white/35">
              Admin Portal
            </span>
            <span className="text-neutral-200 dark:text-white/15">/</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]
              text-emerald-600/70 dark:text-emerald-500/55">
              thedevsden
            </span>
          </div>

          <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl
            text-neutral-900 dark:text-white/90">
            thedevsden
            <span className="ml-2 text-neutral-300 dark:text-white/25">Admin.</span>
          </h1>

          <p className="max-w-md text-sm leading-6 text-neutral-500 dark:text-white/35">
            Manage content, settings and data powering your portfolio website.
          </p>
        </header>

        {/* ── Section ── */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em]
              text-emerald-600/60 dark:text-emerald-500/50">
              Content management
            </p>
            <div className="h-px flex-1 bg-neutral-100 dark:bg-white/5" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {portalLinks.map((link) => (
              <PortalCard key={link.href} link={link} />
            ))}
            <ComingSoonCard />
          </div>
        </div>

      </div>
    </main>
  )
}