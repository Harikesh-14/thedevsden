import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "hi", "tr", "ru"],
  defaultLocale: "en",
  localePrefix: "always"
})