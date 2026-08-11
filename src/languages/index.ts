import { TEXT as enTEXT } from '@/text/en';
import { SEO as enSEO, BRANDING as enBRANDING } from '@/custom/seo/en';

import { TEXT as deTEXT } from '@/text/de';
import { SEO as deSEO, BRANDING as deBRANDING } from '@/custom/seo/de';

import { TEXT as pbTEXT } from '@/text/pb';
import { SEO as pbSEO, BRANDING as pbBRANDING } from '@/custom/seo/pb';

import { TEXT as frTEXT } from '@/text/fr';
import { SEO as frSEO, BRANDING as frBRANDING } from '@/custom/seo/fr';

import { TEXT as hiTEXT } from '@/text/hi';
import { SEO as hiSEO, BRANDING as hiBRANDING } from '@/custom/seo/hi';

export const languages = {
  en: { TEXT: enTEXT, SEO: enSEO, BRANDING: enBRANDING },
  de: { TEXT: deTEXT, SEO: deSEO, BRANDING: deBRANDING },
  pb: { TEXT: pbTEXT, SEO: pbSEO, BRANDING: pbBRANDING },
  fr: { TEXT: frTEXT, SEO: frSEO, BRANDING: frBRANDING },
  hi: { TEXT: hiTEXT, SEO: hiSEO, BRANDING: hiBRANDING },
};

export type LangKey = keyof typeof languages;

export const DEFAULT_LANGUAGE: LangKey =
  (process.env.NEXT_PUBLIC_LANGUAGE as LangKey) || 'en';

export const AVAILABLE_LANGUAGES: LangKey[] =
  (process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES?.split(',') as LangKey[])
    ?.filter((key) => key in languages) || (['en'] as LangKey[]);




// import * as en from '@/text/en';
// import * as de from '@/text/de';
// import * as pb from '@/text/pb';
// import * as fr from '@/text/fr';
// import * as hi from '@/text/hi';

// export const languages = { en, de, pb, fr, hi };
// export type LangKey = keyof typeof languages;

// // Default language
// export const DEFAULT_LANGUAGE: LangKey =
//   (process.env.NEXT_PUBLIC_LANGUAGE as LangKey) || 'en';

// // Available language list from env
// export const AVAILABLE_LANGUAGES: LangKey[] = (
//   process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES?.split(',') as LangKey[]
// )?.filter((key) => key in languages) || (['en'] as LangKey[]);
