"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import ModeToggle from "./mode-toggle"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import ModeTransition from "./mode-transition"

const navLinks = [
  { label: "About me", href: "#about-me" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experiences", href: "#experiences" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact-me" },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [developerMode, setDeveloperMode] = useState<boolean | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const storedMode = localStorage.getItem("devMode")

    setDeveloperMode(storedMode === "true")
  }, [])

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

  const toggleDeveloperMode = (checked: boolean) => {
    if (!checked) {
      setDeveloperMode(false);
      localStorage.setItem("devMode", "false")
      return;
    }

    setIsTransitioning(true)

    setTimeout(() => {
      localStorage.setItem("devMode", "true");
      setDeveloperMode(true);

      router.push("/developer-dashboard");
    }, 900);
  }

  // Don't render the switch until localStorage has been checked
  const isDeveloperModeLoaded = developerMode !== null

  return (
    <>
      {isTransitioning && <ModeTransition mode="developer" />}

      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5">
        <div
          className={cn(
            "pointer-events-auto",
            "w-full max-w-4xl",
            "flex items-center justify-between gap-3 sm:gap-5",
            "h-13 rounded-full px-5",
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
            className="flex shrink-0 items-baseline gap-px select-none"
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
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150",
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
          <div className="flex shrink-0 items-center gap-2">
            {/* Desktop Dev Mode */}
            <label
              htmlFor="dev-dashboard"
              className={cn(
                "hidden cursor-pointer items-center gap-2 sm:flex",
                "rounded-full px-3 py-1.5",
                "bg-black/4 dark:bg-white/5",
                "border border-black/[0.07] dark:border-white/8",
                "transition-colors duration-150",
                "hover:bg-black/[0.07] dark:hover:bg-white/8"
              )}
            >
              {isDeveloperModeLoaded && (
                <Switch
                  id="dev-dashboard"
                  checked={developerMode}
                  onCheckedChange={toggleDeveloperMode}
                  className={cn(
                    "h-4.5 w-8 scale-90",
                    "data-[state=checked]:bg-emerald-500",
                    "dark:data-[state=checked]:bg-emerald-400",
                    "dark:bg-neutral-700"
                  )}
                />
              )}

              <span className="pr-0.5 text-[12px] font-medium whitespace-nowrap text-zinc-400 dark:text-neutral-500">
                Dev mode
              </span>
            </label>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
              className={cn(
                "flex items-center justify-center md:hidden",
                "h-8 w-8 rounded-full",
                "text-zinc-500 dark:text-neutral-400",
                "hover:bg-black/6 dark:hover:bg-white/8",
                "transition-colors duration-150"
              )}
            >
              {isMobileMenuOpen ? (
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className={cn(
              "fixed inset-x-4 top-20 mx-auto max-w-lg rounded-2xl p-5",
              "bg-white/95 dark:bg-neutral-900/95",
              "border border-neutral-200 dark:border-neutral-800",
              "shadow-2xl backdrop-blur-2xl",
              "flex animate-in flex-col gap-4 duration-200",
              "fade-in slide-in-from-top-4"
            )}
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    "text-zinc-600 dark:text-neutral-300",
                    "hover:text-zinc-900 dark:hover:text-neutral-100",
                    "hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10",
                    pathname === href && "font-semibold text-emerald-500"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />

            {/* Mobile Dev Mode */}
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-sm font-medium text-zinc-600 dark:text-neutral-300">
                Dev mode
              </span>

              {isDeveloperModeLoaded && (
                <Switch
                  id="dev-dashboard-mobile"
                  checked={developerMode}
                  onCheckedChange={toggleDeveloperMode}
                  className={cn(
                    "h-4.5 w-8 scale-90",
                    "data-[state=checked]:bg-emerald-500",
                    "dark:data-[state=checked]:bg-emerald-400"
                  )}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
