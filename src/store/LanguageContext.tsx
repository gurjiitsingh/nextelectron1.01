'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import { languages, LangKey, DEFAULT_LANGUAGE } from '@/languages';

type LanguageContextType = {
  lang: LangKey;
  changeLanguage: (lang: LangKey) => void;
  TEXT: any;
  SEO: any;
  BRANDING: any;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<LangKey | null>(null);

  useEffect(() => {
    const storedLang = localStorage.getItem('lang') as LangKey | null;

    if (storedLang && languages[storedLang]) {
      setLang(storedLang);
    } else if (DEFAULT_LANGUAGE && languages[DEFAULT_LANGUAGE]) {
      // First time visitor → use .env language
      setLang(DEFAULT_LANGUAGE);
      localStorage.setItem('lang', DEFAULT_LANGUAGE);
    } else {
      // Fallback to browser language
      const browserLang = navigator.language.slice(0, 2) as LangKey;
      const fallbackLang = languages[browserLang] ? browserLang : 'en';
      setLang(fallbackLang);
      localStorage.setItem('lang', fallbackLang);
    }
  }, []);

  const changeLanguage = (newLang: LangKey) => {
    if (!languages[newLang]) return;
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const { TEXT, SEO, BRANDING } = useMemo(() => {
    if (!lang || !languages[lang]) return { TEXT: {}, SEO: {}, BRANDING: {} };
    return {
      TEXT: languages[lang].TEXT,
      SEO: languages[lang].SEO,
      BRANDING: languages[lang].BRANDING,
    };
  }, [lang]);

  if (!lang) return null;

 

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, TEXT, SEO, BRANDING }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
