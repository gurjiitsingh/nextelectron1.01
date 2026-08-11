import * as textEn from '@/text/en';
import * as textDe from '@/text/de';
import * as textPb from '@/text/pb';
import * as textFr from '@/text/fr';
import * as textHi from '@/text/hi';

// import * as seoEn from '@/seo/en';
// import * as seoDe from '@/seo/de';
// import * as seoPb from '@/seo/pb';
// import * as seoFr from '@/seo/fr';
// import * as seoHi from '@/seo/hi';



const LANG = process.env.NEXT_PUBLIC_LANGUAGE || 'de';

const textLanguages = { en: textEn, de: textDe, pb: textPb, fr: textFr, hi: textHi };
//const seoLanguages = { en: seoEn, de: seoDe, pb: seoPb, fr: seoFr, hi: seoHi };

export const TEXT = textLanguages[LANG as keyof typeof textLanguages].TEXT;
//export const SEO = seoLanguages[LANG as keyof typeof seoLanguages].SEO;
//export const BRANDING = seoLanguages[LANG as keyof typeof seoLanguages].BRANDING;




import {  SEO as enSEO, BRANDING as enBRANDING } from '@/custom/seo/en';
import {  SEO as deSEO, BRANDING as deBRANDING } from '@/custom/seo/de';
import {  SEO as pbSEO, BRANDING as pbBRANDING } from '@/custom/seo/pb';
import {  SEO as frSEO, BRANDING as frBRANDING } from '@/custom/seo/fr';
import {  SEO as hiSEO, BRANDING as hiBRANDING } from '@/custom/seo/hi';

export const languages = {
  en: {  SEO: enSEO, BRANDING: enBRANDING },
  de: {  SEO: deSEO, BRANDING: deBRANDING },
  pb: {  SEO: pbSEO, BRANDING: pbBRANDING },
  fr: {  SEO: frSEO, BRANDING: frBRANDING },
  hi: {  SEO: hiSEO, BRANDING: hiBRANDING },
};

export const SEO = languages[LANG as keyof typeof languages].SEO;
export const BRANDING = languages[LANG as keyof typeof languages].BRANDING;



// import * as en from './en';
// import * as de from './de';
// import * as pb from './pb';
// import * as fr from './fr';
// import * as hi from './hi';

// const LANG = process.env.NEXT_PUBLIC_LANGUAGE || 'de';

// const languages = { en, de, pb, fr, hi };

// export const TEXT = languages[LANG as keyof typeof languages].TEXT;
// export const SEO = languages[LANG as keyof typeof languages].SEO;
