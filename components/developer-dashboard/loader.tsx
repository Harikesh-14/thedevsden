"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const QUIPS = [
  "no cap, compiling vibes...",
  "brb touching grass (jk never)",
  "git pull origin main fr fr",
  "loading your whole personality...",
  "npm install good-vibes",
  "fixing bugs before they fix you",
  "console.log('you got this')",
  "it's giving... loading screen",
  "your code is bussin rn",
  "404: patience not found",
]

export default function LoaderPage() {
  const [quipIndex, setQuipIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setQuipIndex((i) => (i + 1) % QUIPS.length)
        setVisible(true)
      }, 300)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <main
      role="status"
      aria-label="Loading the developer dashboard"
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden",
        "bg-white dark:bg-neutral-950",
        "px-6 py-12",
      )}
    >
      {/* Logo */}
      <div aria-hidden className="flex items-baseline gap-px select-none">
        <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-600">
          the
        </span>
        <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-emerald-500 dark:text-emerald-400">
          devs
        </span>
        <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-600">
          den
        </span>
      </div>

      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div
          aria-hidden
          className="absolute size-24 animate-spin rounded-[28px] border border-transparent
            border-b-indigo-400/50 border-l-indigo-400/50 dark:border-b-indigo-500/40 dark:border-l-indigo-500/40"
          style={{ animationDuration: "2s", animationDirection: "reverse" }}
        />
        {/* Inner ring */}
        <div
          aria-hidden
          className="absolute size-19 animate-spin rounded-[22px] border border-transparent
            border-r-emerald-500 border-t-emerald-500 dark:border-r-emerald-400 dark:border-t-emerald-400"
          style={{ animationDuration: "1.2s" }}
        />
        {/* Core box */}
        <div
          aria-hidden
          className={cn(
            "flex size-16 items-center justify-center rounded-[18px]",
            "border border-neutral-200 bg-white",
            "dark:border-white/8 dark:bg-neutral-900",
            "animate-[pulse-subtle_1.8s_ease-in-out_infinite]",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="size-7 text-emerald-500 dark:text-emerald-400"
          >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p
          className="text-[22px] font-semibold tracking-[-0.02em]
            text-neutral-900 dark:text-white/90"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          hold on bestie
        </p>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
          setting up your{" "}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            dev dashboard
          </span>
        </p>
      </div>

      {/* Progress bar */}
      <div
        aria-hidden
        className="h-0.75 w-48 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/6"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-emerald-500 to-indigo-500"
          style={{ animation: "fill-bar 2.4s cubic-bezier(0.4,0,0.2,1) infinite" }}
        />
      </div>

      {/* Bouncing dots */}
      <div aria-hidden className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "size-1.75 rounded-full",
              i === 0 && "bg-emerald-500 dark:bg-emerald-400",
              i === 1 && "bg-emerald-400 dark:bg-emerald-500",
              i === 2 && "bg-indigo-400 dark:bg-indigo-500",
            )}
            style={{ animation: `dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>

      {/* Rotating quip */}
      <p
        aria-live="polite"
        className={cn(
          "rounded-full border px-4 py-1.5 text-[12px] font-medium tracking-wide transition-opacity duration-300",
          "border-neutral-200 bg-white text-neutral-500",
          "dark:border-white/8 dark:bg-white/4 dark:text-neutral-400",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        {QUIPS[quipIndex]}
      </p>

      {/* Keyframe injection */}
      <style>{`
        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(20px,15px) scale(1.08); }
        }
        @keyframes pulse-subtle {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(0.95); }
        }
        @keyframes fill-bar {
          0%   { width: 0%;   opacity: 1; }
          70%  { width: 100%; opacity: 1; }
          85%  { width: 100%; opacity: 0; }
          86%  { width: 0%;   opacity: 0; }
          100% { width: 0%;   opacity: 1; }
        }
        @keyframes dot-bounce {
          0%,80%,100% { transform: scale(1);   opacity: 0.4; }
          40%          { transform: scale(1.5); opacity: 1;   }
        }
      `}</style>
    </main>
  )
}