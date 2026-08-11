'use client';

import { useState, useEffect } from 'react';
import { languages, LangKey, DEFAULT_LANGUAGE } from '@/languages';

export const useLanguage = () => {
  const [lang, setLang] = useState<LangKey | null>(null);

  useEffect(() => {
    const storedLang = localStorage.getItem('lang') as LangKey | null;

    if (storedLang && languages[storedLang]) {
      setLang(storedLang);
    } else {
      const browserLang = navigator.language.slice(0, 2) as LangKey;
      const detectedLang = languages[browserLang] ? browserLang : DEFAULT_LANGUAGE;
      setLang(detectedLang);
      localStorage.setItem('lang', detectedLang);
    }
  }, []);

  const changeLanguage = (newLang: LangKey) => {
    if (languages[newLang]) {
      setLang(newLang);
      localStorage.setItem('lang', newLang);
    }
  };

  const TEXT = lang ? languages[lang].TEXT : {};
  const SEO = lang ? languages[lang].SEO : {};

  return { lang, TEXT, SEO, changeLanguage };
};
