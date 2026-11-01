import Sidebar from "@/components/developer-dashboard/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import React from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <main className="min-h-screen">
        <Sidebar />

        <div className="min-h-screen md:pl-68">
          {children}
          <Toaster position="top-right" />
        </div>
      </main>
    </NextIntlClientProvider>
  )
}
