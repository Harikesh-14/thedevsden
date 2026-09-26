"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ModeToggle from "./mode-toggle"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "About me", href: "#about-me" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experiences", href: "#experiences" },
  { label: "Contact", href: "#contact-me" },
]

export default function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Prevent background body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 sm:pt-5 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto",
            "w-full max-w-4xl",
            "flex items-center justify-between gap-3 sm:gap-5",
            "h-13 px-5 rounded-full",
            "bg-white/75 dark:bg-neutral-950/80",
            "border border-white/90 dark:border-white/[0.07]",
            "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]",
            "dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_4px_24px_rgba(0,0,0,0.45)]",
            "backdrop-blur-xl backdrop-saturate-150",
            "transition-shadow duration-300"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-baseline gap-px shrink-0 select-none"
          >
            <span className="text-[15px] font-bold tracking-[-0.02em] text-zinc-900 dark:text-neutral-100">
              the
            </span>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-emerald-500 dark:text-emerald-400">
              devs
            </span>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-zinc-900 dark:text-neutral-100">
              den
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-150",
                  "text-zinc-500 dark:text-neutral-400",
                  "hover:text-zinc-900 dark:hover:text-neutral-100",
                  "hover:bg-emerald-500/8 dark:hover:bg-emerald-400/8",
                  pathname === href && [
                    "text-emerald-600 dark:text-emerald-400",
                    "bg-emerald-500/8 dark:bg-emerald-400/8",
                  ]
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dev toggle pill */}
            <label
              htmlFor="dev-dashboard"
              className={cn(
                "hidden sm:flex items-center gap-2 cursor-pointer",
                "px-3 py-1.5 rounded-full",
                "bg-black/4 dark:bg-white/5",
                "border border-black/[0.07] dark:border-white/8",
                "transition-colors duration-150",
                "hover:bg-black/[0.07] dark:hover:bg-white/8"
              )}
            >
              <Switch
                id="dev-dashboard"
                className={cn(
                  "h-4.5 w-8 scale-90",
                  "data-[state=checked]:bg-emerald-500",
                  "dark:data-[state=checked]:bg-emerald-400",
                  "dark:bg-neutral-700"
                )}
              />
              <span className="text-[12px] font-medium text-zinc-400 dark:text-neutral-500 whitespace-nowrap pr-0.5">
                Dev mode
              </span>
            </label>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
              className={cn(
                "md:hidden flex items-center justify-center",
                "w-8 h-8 rounded-full",
                "text-zinc-500 dark:text-neutral-400",
                "hover:bg-black/6 dark:hover:bg-white/8",
                "transition-colors duration-150"
              )}
            >
              {isMobileMenuOpen ? (
                /* Close Icon (X) */
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4l8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                /* Hamburger Icon */
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 4h12M2 8h12M2 12h8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className={cn(
              "fixed top-20 inset-x-4 max-w-lg mx-auto p-5 rounded-2xl",
              "bg-white/95 dark:bg-neutral-900/95",
              "border border-neutral-200 dark:border-neutral-800",
              "shadow-2xl backdrop-blur-2xl",
              "flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200"
            )}
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium px-4 py-2.5 rounded-xl transition-all",
                    "text-zinc-600 dark:text-neutral-300",
                    "hover:text-zinc-900 dark:hover:text-neutral-100",
                    "hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10",
                    pathname === href && "text-emerald-500 font-semibold"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />

            {/* Mobile Dev Mode Switcher */}
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-sm font-medium text-zinc-600 dark:text-neutral-300">
                Dev mode
              </span>
              <Switch
                id="dev-dashboard-mobile"
                className={cn(
                  "h-4.5 w-8 scale-90",
                  "data-[state=checked]:bg-emerald-500",
                  "dark:data-[state=checked]:bg-emerald-400"
                )}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}