import Header from "@/components/header"
import { Toaster } from "@/components/ui/sonner"
import React from "react"

export default function PorfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <Header />
      <Toaster position="top-right" />
      {children}
    </section>
  )
}
