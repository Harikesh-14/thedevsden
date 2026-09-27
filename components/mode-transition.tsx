type Mode = "developer" | "portfolio"

export default function ModeTransition({ mode }: { mode: Mode }) {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-neutral-950">
      <div className="flex flex-col items-center gap-5">

        {/* Spinner */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />

          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400" />
        </div>

        {/* Text */}
        <div className="text-center">
          {mode === "developer" ? (
            <p className="text-sm font-medium tracking-wide text-white">
              Entering Developer Mode
            </p>
          ) : (
            <p className="text-sm font-medium tracking-wide text-white">
              Entering Portfolio Mode
            </p>
          )}

          <p className="mt-1 text-xs text-white/40">
            Initializing workspace...
          </p>
        </div>

      </div>
    </div>
  )
}
