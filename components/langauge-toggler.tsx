"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "./ui/select";

export default function LanguageToggler() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("LanguageToggler")

  function handleLanguageChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger>
        <Languages />
      </SelectTrigger>

      <SelectContent position="popper" sideOffset={5}>
        <SelectGroup>
          <SelectLabel>{t.raw("indian")}</SelectLabel>
          <SelectItem value="hi">हिन्दी</SelectItem>
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>{t.raw("other")}</SelectLabel>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="tr">Türkçe</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}