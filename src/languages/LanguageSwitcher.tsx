'use client';
import { useLanguage } from '@/store/LanguageContext';
import { AVAILABLE_LANGUAGES } from '@/languages';

const languageLabels: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  pb: 'Punjabi',
  fr: 'Français',
  hi: 'हिंदी',
};

export const LanguageSwitcher = () => {
  const { lang, changeLanguage } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => changeLanguage(e.target.value as any)}
      className="rounded-md px-2 py-[1px] border"
    >
      {AVAILABLE_LANGUAGES.map((code) => (
        <option key={code} value={code}>
          {languageLabels[code] || code.toUpperCase()}
        </option>
      ))}
    </select>
  );
};
