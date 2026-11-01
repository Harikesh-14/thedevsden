import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { notFound } from "next/navigation";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale

  const locale = hasLocale(routing.locales, requested) ? requested : null

  if (!locale) {
    notFound()
  }

  return {
    locale,
    messages: (
      await import(`../messages/${locale}.json`)
    ).default,
  }
})