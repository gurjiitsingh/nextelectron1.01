 // POS_THEME.ts


// =====================================================
// POS BACKGROUNDS
// =====================================================

export type PosBackground =
  | 'white'
  | 'softSlate'
  | 'darkSlate'
  | 'black'
  | 'dark'
  | 'blue';


// =====================================================
// BACKGROUND CONFIG TYPE
// =====================================================

export type PosBackgroundConfig = {
  name: string;

  // Tailwind background class
  className: string;

  // Tailwind main text class
  text: string;

  // Actual CSS main text color
  textColor: string;

  // Tailwind muted text class
  mutedText: string;

  // Actual CSS muted text color
  mutedTextColor: string;

  // Text color used on light surfaces
  surfaceText: string;

  // Normal UI border
  border: string;

  // Softer border for items/cards/rows
  itemBorder: string;

  // Row separator
  divide: string;

  // Actual CSS line/separator color
  line: string;
};


// =====================================================
// POS BACKGROUNDS
// =====================================================

export const POS_BACKGROUNDS: Record<
  PosBackground,
  PosBackgroundConfig
> = {

  // ===================================================
  // WHITE
  // ===================================================

  white: {
    name: 'White',

    className: 'bg-white',

    // Main text
    text: 'text-slate-800',
    textColor: '#1E293B',

    // Secondary text
    mutedText: 'text-slate-500',
    mutedTextColor: '#64748B',

    // Text used on light surfaces
    surfaceText: 'text-slate-800',

    // Normal UI border
    border: 'border-slate-200',

    // Softer item/card border
    itemBorder: 'border-slate-200/60',

    // Row separator
    divide: 'divide-slate-100',

    // CSS line color
    line: '#E2E8F0',
  },


  // ===================================================
  // SOFT SLATE
  // ===================================================

  softSlate: {
    name: 'Soft Slate',

    className: 'bg-slate-200',

    // Main text
    text: 'text-slate-800',
    textColor: '#1E293B',

    // Secondary text
    mutedText: 'text-slate-500',
    mutedTextColor: '#64748B',

    // Text used on light surfaces
    surfaceText: 'text-slate-800',

    // Normal UI border
    border: 'border-slate-300',

    // Softer item/card border
    itemBorder: 'border-slate-300/60',

    // Row separator
    divide: 'divide-slate-200',

    // CSS line color
    line: '#CBD5E1',
  },


  // ===================================================
  // DARK SLATE
  // ===================================================

  darkSlate: {
    name: 'Dark Slate',

    className: 'bg-slate-700',

    // Main text
    text: 'text-white',
    textColor: '#FFFFFF',

    // Secondary text
    mutedText: 'text-slate-200',
    mutedTextColor: '#E2E8F0',

    // Text used on light surfaces
    surfaceText: 'text-slate-800',

    // Normal UI border
    border: 'border-slate-500/50',

    // Softer item/card border
    itemBorder: 'border-slate-500/30',

    // Row separator
    divide: 'divide-slate-500/30',

    // CSS line color
    line: '#64748B',
  },


  // ===================================================
  // BLACK
  // ===================================================

  black: {
    name: 'Black',

    className: 'bg-black',

    // Main text
    text: 'text-white',
    textColor: '#FFFFFF',

    // Secondary text
    mutedText: 'text-slate-300',
    mutedTextColor: '#CBD5E1',

    // Text used on light surfaces
    surfaceText: 'text-slate-800',

    // Normal UI border
    border: 'border-slate-700',

    // Softer item/card border
    itemBorder: 'border-slate-800',

    // Row separator
    divide: 'divide-slate-800',

    // CSS line color
    line: '#334155',
  },


  // ===================================================
  // DARK
  // ===================================================

  dark: {
    name: 'Dark',

    className: 'bg-slate-800',

    // Main text
    text: 'text-white',
    textColor: '#FFFFFF',

    // Secondary text
    mutedText: 'text-slate-300',
    mutedTextColor: '#CBD5E1',

    // Text used on light surfaces
    surfaceText: 'text-slate-800',

    // Normal UI border
    border: 'border-slate-600',

    // Softer item/card border
    itemBorder: 'border-slate-700',

    // Row separator
    divide: 'divide-slate-700',

    // CSS line color
    line: '#475569',
  },


  // ===================================================
  // BLUE
  // ===================================================

  blue: {
    name: 'Blue',

    // Main background
    className: 'bg-[#406093]',

    // Main text
    text: 'text-white',
    textColor: '#FFFFFF',

    // Clearly visible secondary text
    mutedText: 'text-[#C7D2E3]',
    mutedTextColor: '#D6E2F2',

    // Text used on light surfaces
    surfaceText: 'text-slate-800',

    // Normal UI border
    border: 'border-[#6F8FBE]',

    // Softer item/card border
    itemBorder: 'border-[#5878AA]',

    // Row separator
    divide: 'divide-[#6F8FBE]',

    // Clearly visible CSS line
    line: '#9DB9DE',
  },
};


// =====================================================
// POS THEMES
// =====================================================

export type PosThemeName =
  | 'blue'
  | 'orange'
  | 'teal';


// =====================================================
// POS THEME CONFIG TYPE
// =====================================================

export type PosThemeConfig = {
  // Selected / active color
  primary: string;

  // Hover color
  primaryHover: string;

  // Very light theme surface
  primaryLight: string;

  // Hover / selected-light surface
  primarySelected: string;

  // Primary readable text
  primaryText: string;

  // Inactive button background
  inactive: string;
};


// =====================================================
// POS THEMES
// =====================================================

export const POS_THEMES: Record<
  PosThemeName,
  PosThemeConfig
> = {

  // ===================================================
  // BLUE
  // ===================================================

  blue: {
    primary: '#4275EC',

    primaryHover: '#3569DF',

    primaryLight: '#EEF3FF',

    primarySelected: '#DCE6FF',

    primaryText: '#315FCF',

    inactive: '#6f86bd',
  },
// #5C6A83

  // ===================================================
  // ORANGE
  // ===================================================

  orange: {
    primary: '#E98A3A',

    primaryHover: '#D97A2B',

    primaryLight: '#FFF3E8',

    primarySelected: '#FFE5D0',

    primaryText: '#C96F25',

    inactive: '#4c4c4cb8',
  },


  // ===================================================
  // TEAL
  // ===================================================

  teal: {
    primary: '#3BA7A0',

    primaryHover: '#31938D',

    primaryLight: '#E9F7F6',

    primarySelected: '#D4EFED',

    primaryText: '#287F7A',

    inactive: '#68827f',
  },
};