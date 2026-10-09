export default function LoadingSkeleton() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-transparent">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-16 left-1/4 h-64 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/8"
      />
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 h-3.5 w-40 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10" />
        <div className="mb-3 h-10 w-2/3 animate-pulse rounded-xl bg-neutral-200 dark:bg-white/10" />
        <div className="mb-2 h-4 w-1/3 animate-pulse rounded-full bg-neutral-100 dark:bg-white/5" />
        <div className="mb-8 h-4 w-1/2 animate-pulse rounded-full bg-neutral-100 dark:bg-white/5" />
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className="h-44 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/[0.07] dark:bg-white/3" />
            <div className="h-60 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/[0.07] dark:bg-white/3" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/[0.07] dark:bg-white/3" />
        </div>
      </div>
    </main>
  )
}