"use client"

import ModeToggle from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.ChangeEvent) {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      const data = await login("ranjansinhaharikesh@gmail.com", password)

      router.push("/developer-dashboard")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 dark:bg-neutral-950">
      {/* Ambient emerald glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 -bottom-16 h-52 w-72 rounded-full bg-emerald-400/6 blur-3xl dark:bg-emerald-500/6"
      />

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative z-10 w-full max-w-sm",
          "rounded-[24px]",
          "border border-neutral-200/80 dark:border-white/[0.07]",
          "bg-white/80 dark:bg-neutral-950/80",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.6)_inset] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]",
          "shadow-[0_24px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]",
          "px-8 py-8"
        )}
      >
        {/* Top row */}
        <div className="mb-9 flex items-center justify-between">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8.5 rounded-xl border-neutral-200/80 dark:border-white/8"
            asChild
          >
            <Link href="/">
              <Home className="size-3.5" />
            </Link>
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-px select-none">
            <span className="text-[13px] font-bold tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
              the
            </span>
            <span className="text-[13px] font-bold tracking-[-0.02em] text-emerald-500 dark:text-emerald-400">
              devs
            </span>
            <span className="text-[13px] font-bold tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
              den
            </span>
          </Link>

          <ModeToggle />
        </div>

        {/* Heading */}
        <div className="mb-7">
          <div className="mb-4 h-0.5 w-6 rounded-full bg-emerald-500" />
          <h1 className="mb-2 text-[22px] leading-tight font-semibold tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
            Are you{" "}
            <span className="text-emerald-500 dark:text-emerald-400">
              Harikesh?
            </span>
          </h1>
          <p className="text-[13px] leading-relaxed text-neutral-400 dark:text-neutral-500">
            This dashboard is private. Prove it's you to continue.
          </p>
        </div>

        {/* Password field */}
        <div className="mb-5 space-y-2">
          <Label
            htmlFor="password"
            className="text-[10px] font-semibold tracking-[0.08em] text-neutral-400 uppercase dark:text-neutral-600"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={cn(
              "h-11 rounded-xl",
              "border-neutral-200/80 bg-neutral-50/80",
              "dark:border-white/8 dark:bg-white/4",
              "placeholder:text-neutral-300 dark:placeholder:text-neutral-700",
              "text-neutral-900 dark:text-neutral-100",
              "focus-visible:border-emerald-400/60 dark:focus-visible:border-emerald-600/50",
              "focus-visible:ring-2 focus-visible:ring-emerald-500/10 dark:focus-visible:ring-emerald-500/10",
              "transition-all duration-150"
            )}
          />
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || !password}
          className={cn(
            "h-11 w-full rounded-xl",
            "bg-emerald-500 hover:bg-emerald-600",
            "dark:bg-emerald-500 dark:hover:bg-emerald-400",
            "text-white dark:text-neutral-950",
            "text-[13.5px] font-semibold",
            "border-0 shadow-none",
            "transition-all duration-150",
            "disabled:opacity-40"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Verifying…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              That's me
              <ArrowRight className="size-3.5" />
            </span>
          )}
        </Button>

        {/* Footer hint */}
        <p className="mt-5 text-center text-[11px] text-neutral-300 dark:text-neutral-700">
          Private access only · thedevsden
        </p>
      </form>
    </div>
  )
}
