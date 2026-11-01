"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
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
          <SelectLabel>Indian Languages</SelectLabel>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="hi">हिन्दी</SelectItem>
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>Foreign Languages</SelectLabel>
          <SelectItem value="tr">Türkçe</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}