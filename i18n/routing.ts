import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hi", "ta", "en", "tr", "ru"],
  defaultLocale: "en",
  localePrefix: "always"
})