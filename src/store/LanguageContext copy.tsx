'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { languages, LangKey, DEFAULT_LANGUAGE } from '@/languages';

type LanguageContextType = {
  lang: LangKey;
  changeLanguage: (lang: LangKey) => void;
  TEXT: any;
  SEO: any;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<LangKey | null>(null); // <-- null initially to avoid mismatch

  useEffect(() => {
    // Run this on client only
    const storedLang = localStorage.getItem('lang') as LangKey | null;

    if (storedLang && languages[storedLang]) {
      setLang(storedLang);
    } else {
      const browserLang = navigator.language.slice(0, 2) as LangKey;
      const detectedLang = languages[browserLang] ? browserLang : DEFAULT_LANGUAGE;
      localStorage.setItem('lang', detectedLang);
      setLang(detectedLang);
    }
  }, []);

  const changeLanguage = (newLang: LangKey) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  // While waiting for client language, render nothing
  if (!lang) return null;

  const TEXT = languages[lang].TEXT;
  const SEO = languages[lang].SEO;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, TEXT, SEO }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
