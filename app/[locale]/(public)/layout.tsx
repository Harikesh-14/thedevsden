import Header from "@/components/header"
import { Toaster } from "@/components/ui/sonner"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import React from "react"

export default async function PorfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <section>
        <Header />
        <Toaster position="top-right" />
        {children}
      </section>
    </NextIntlClientProvider>
  )
}
