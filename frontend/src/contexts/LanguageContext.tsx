import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations, Translations } from "@/i18n/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("donsang_lang") as Lang) || "fr";
  });

  const isRtl = false;
  const t = translations[lang];

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("donsang_lang", l);
  };

  // Keep LTR direction for all languages
  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
