import { PortalLink } from "@/lib/admin-portal-links"
import { cn } from "cn"
import Link from "next/link"

export function PortalCard({ link }: { link: PortalLink }) {
  const Icon = link.icon

  return (
    <Link
      href={link.href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[18px] p-5",
        "transition-all duration-200",
        "border border-neutral-200 bg-white shadow-sm shadow-neutral-900/4",
        "hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50/20",
        "hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]",
        "dark:border-white/[0.07] dark:bg-white/3 dark:shadow-none",
        "dark:hover:border-emerald-500/25 dark:hover:bg-emerald-500/4",
        "dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
      )}
    >
      <div className={cn(
        "absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-emerald-500 via-emerald-400 to-transparent",
        "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
      )} />

      {/* Icon */}
      <div className={cn(
        "mb-4 flex size-9 items-center justify-center rounded-xl",
        "border border-emerald-200/80 bg-emerald-50 text-emerald-600",
        "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-400",
      )}>
        <Icon className="size-4" />
      </div>

      {/* Text */}
      <p className="mb-1.5 text-[13.5px] font-semibold tracking-[-0.01em]
        text-neutral-900 dark:text-white/85">
        {link.title}
      </p>
      <p className="text-[12px] leading-[1.65] text-neutral-500 dark:text-white/30">
        {link.description}
      </p>

      {/* Arrow — appears on hover */}
      <div className={cn(
        "absolute bottom-4 right-4 flex size-6 items-center justify-center rounded-lg",
        "opacity-0 transition-all duration-200 group-hover:opacity-100",
        "border border-emerald-200 bg-emerald-50 text-emerald-600",
        "dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-400",
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className="size-3"
        >
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </Link>
  )
}