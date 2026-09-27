import Sidebar from "@/components/developer-dashboard/sidebar"
import React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen">
      <Sidebar />

      <div className="min-h-screen md:pl-68">{children}</div>
    </main>
  )
}
