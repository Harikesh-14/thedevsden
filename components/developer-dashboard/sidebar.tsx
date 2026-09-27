"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Map,
  Menu,
  Moon,
  Sun,
  User2,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { cn } from "@/lib/utils"

const navigation = [
  {
    label: "Project Planner",
    href: "/developer-dashboard/project-planner",
    icon: LayoutDashboard,
  },
  {
    label: "Task Planner",
    href: "/developer-dashboard/task-planner",
    icon: ListTodo,
  },
  {
    label: "Roadmap",
    href: "/developer-dashboard/roadmap",
    icon: Map,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [isOpen, setIsOpen] = useState(false)
  const [portfolioMode, setPortfolioMode] = useState(true)

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile floating menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        className={cn(
          "fixed top-4 left-4 z-40 md:hidden",
          "flex size-11 items-center justify-center",
          "rounded-2xl",
          "border border-white/80 dark:border-white/[0.07]",
          "bg-white/75 dark:bg-neutral-900/85",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
          "dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]",
          "text-neutral-600 dark:text-neutral-300",
          "transition-all duration-200",
          "hover:bg-white dark:hover:bg-neutral-800",
          "active:scale-95"
        )}
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className={cn(
            "fixed inset-0 z-40 md:hidden",
            "bg-black/25 dark:bg-black/50",
            "backdrop-blur-[2px]",
            "animate-in duration-200 fade-in"
          )}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-4 bottom-4 left-4 z-50",
          "flex w-57 flex-col",
          "rounded-[22px]",
          "border-2 border-white/[0.07] dark:border-white/6",
          "bg-white/75 dark:bg-neutral-900/85",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]",
          "shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
          "dark:shadow-[0_8px_40px_rgba(0,0,0,0.55)]",
          "overflow-hidden",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]",
          "transition-transform duration-300 ease-out"
        )}
      >
        {/* Header */}
        <div className="relative z-10 px-5 pt-5">
          <div className="flex items-start justify-between">
            <Link
              href="/"
              onClick={closeSidebar}
              className="flex items-baseline gap-px select-none"
            >
              <span className="text-[14px] font-bold tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                the
              </span>

              <span className="text-[14px] font-bold tracking-[-0.02em] text-emerald-500 dark:text-emerald-400">
                devs
              </span>

              <span className="text-[14px] font-bold tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                den
              </span>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close sidebar"
              className={cn(
                "md:hidden",
                "flex size-7 items-center justify-center",
                "rounded-lg",
                "text-neutral-400",
                "hover:bg-neutral-100 hover:text-neutral-700",
                "dark:hover:bg-white/5 dark:hover:text-neutral-200",
                "transition-colors"
              )}
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="mt-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
            Developer Dashboard
          </p>
        </div>

        {/* Divider */}
        <div className="relative z-10 mx-5 mt-4 h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />

        {/* Navigation */}
        <div className="relative z-10 flex-1 scrollbar-none overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2.5 text-[9px] font-semibold tracking-[0.14em] text-neutral-400 uppercase dark:text-neutral-600">
            Workspace
          </p>

          {/* Admin Portal */}
          <Accordion
            type="multiple"
            // defaultValue={["admin-portal"]}
            className="w-full space-y-px"
          >
            <AccordionItem value="admin-portal" className="border-none">
              <AccordionTrigger
                className={cn(
                  "rounded-xl px-2.5 py-2 text-[12.5px] font-medium",
                  "text-neutral-600 dark:text-neutral-400",
                  "hover:bg-neutral-100/80 dark:hover:bg-white/5",
                  "hover:text-neutral-900 dark:hover:text-neutral-200",
                  "transition-all duration-150 hover:no-underline",
                  "[&>svg]:hidden"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg",
                      "border border-emerald-200/80 bg-emerald-50",
                      "dark:border-emerald-800/60 dark:bg-emerald-950/70"
                    )}
                  >
                    <LayoutDashboard className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  Admin Portal
                </span>
              </AccordionTrigger>

              <AccordionContent className="pt-0.5 pb-1">
                <div className="ml-3.25 border-l border-neutral-200/70 pl-3 dark:border-neutral-800/70">
                  <Link
                    href="/blooplingo"
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2.5 py-1.5",
                      "text-[11.5px] font-medium transition-all duration-150",
                      pathname === "/blooplingo"
                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-500 dark:hover:bg-white/5 dark:hover:text-neutral-300"
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-emerald-500/70 dark:bg-emerald-400/70" />
                    Blooplingo
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Main navigation */}
          <div className="mt-1 space-y-px">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeSidebar}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-xl px-2.5 py-2",
                    "text-[12.5px] font-medium transition-all duration-150",
                    isActive
                      ? [
                          "bg-emerald-500/10 dark:bg-emerald-400/10",
                          "text-emerald-600 dark:text-emerald-400",
                          "border border-emerald-200/60 dark:border-emerald-800/50",
                          "shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-none",
                        ]
                      : [
                          "text-neutral-600 dark:text-neutral-400",
                          "border border-transparent",
                          "hover:bg-neutral-100/80 dark:hover:bg-white/5",
                          "hover:text-neutral-900 dark:hover:text-neutral-200",
                        ]
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
                      isActive
                        ? "border border-emerald-200/80 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/70"
                        : "border border-neutral-200/60 bg-neutral-50/80 group-hover:border-neutral-300/60 dark:border-white/6 dark:bg-white/4 dark:group-hover:border-white/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-3.5 transition-colors",
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300"
                      )}
                    />
                  </span>

                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 space-y-2 border-t border-neutral-200/60 p-3 dark:border-white/6">
          {/* Portfolio mode */}
          <div
            className={cn(
              "flex items-center justify-between",
              "rounded-xl px-3 py-2.5",
              "border border-neutral-200/60 dark:border-white/6",
              "bg-neutral-50/60 dark:bg-white/3"
            )}
          >
            <Label
              htmlFor="toggle-portfolio"
              className="cursor-pointer text-[11.5px] font-medium text-neutral-600 dark:text-neutral-400"
            >
              Portfolio mode
            </Label>

            <Switch
              id="toggle-portfolio"
              checked={portfolioMode}
              onCheckedChange={setPortfolioMode}
              className={cn(
                "origin-right scale-[0.8]",
                "data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-400",
                "dark:bg-neutral-700"
              )}
            />
          </div>

          {/* Theme + Profile */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "relative flex size-9 shrink-0 items-center justify-center rounded-xl",
                "border border-neutral-200/60 dark:border-white/[0.07]",
                "bg-neutral-50/60 dark:bg-white/4",
                "text-neutral-500 dark:text-neutral-400",
                "hover:bg-neutral-100 dark:hover:bg-white/8",
                "hover:text-neutral-800 dark:hover:text-neutral-200",
                "transition-all duration-150"
              )}
              aria-label="Toggle theme"
            >
              <Sun className="size-3.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-3.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </button>

            <button
              type="button"
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl",
                "border border-neutral-200/60 dark:border-white/[0.07]",
                "bg-neutral-50/60 dark:bg-white/4",
                "text-[11.5px] font-medium text-neutral-600 dark:text-neutral-400",
                "hover:bg-neutral-100 dark:hover:bg-white/8",
                "hover:text-neutral-800 dark:hover:text-neutral-200",
                "transition-all duration-150"
              )}
            >
              <User2 className="size-3.5" />
              Profile
            </button>
          </div>

          {/* Logout */}
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-center gap-1.5 rounded-xl",
              "border border-red-200/40 dark:border-red-500/10",
              "bg-red-50/50 dark:bg-red-500/5",
              "text-[11.5px] font-medium text-red-500/80 dark:text-red-400/70",
              "hover:bg-red-50 dark:hover:bg-red-500/10",
              "hover:text-red-600 dark:hover:text-red-400",
              "hover:border-red-200/70 dark:hover:border-red-500/20",
              "transition-all duration-150"
            )}
          >
            <LogOut className="size-3.5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
