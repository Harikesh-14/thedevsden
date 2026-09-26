import Header from "@/components/header";
import React from "react";

export default function PorfolioLayout({ children }: { children: React.ReactNode }) {
  return <section>
    <Header />
    {children}
  </section>
}