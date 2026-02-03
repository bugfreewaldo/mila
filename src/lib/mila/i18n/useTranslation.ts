"use client";

import { useAppStore } from "../store";
import { translations, type Language, type Translations } from "./translations";

export function useTranslation(): {
  t: Translations;
  language: Language;
  setLanguage: (lang: Language) => void;
} {
  const { language, setLanguage } = useAppStore();

  return {
    t: translations[language],
    language,
    setLanguage,
  };
}
