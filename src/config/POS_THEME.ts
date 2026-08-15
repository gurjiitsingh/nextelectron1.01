// POS_THEME.ts


// =====================================================
// POS BACKGROUNDS
// =====================================================

export type PosBackground =
  | 'white'
  | 'softSlate'
  | 'darkSlate';


// =====================================================
// BACKGROUND CONFIG TYPE
// =====================================================

export type PosBackgroundConfig = {
  name: string;

  // Background class
  className: string;

  // Default text color
  text: string;

  // Normal UI border
  border: string;

  // Softer border for items/cards/rows
  itemBorder: string;

  // Row separator
  divide: string;

  // CSS color value
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

    text: 'text-slate-800',

    // Normal UI border
    border: 'border-slate-200',

    // Softer item/card border
    itemBorder: 'border-slate-200/60',

    // Very subtle row separator
    divide: 'divide-slate-100',

    // CSS line color
    line: '#E2E8F0',
  },


  // ===================================================
  // SOFT SLATE
  // ===================================================

  softSlate: {
    name: 'Soft Slate',

    className: 'bg-slate-100',

    text: 'text-slate-800',

    // Normal UI border
    border: 'border-slate-300',

    // Softer item/card border
    itemBorder: 'border-slate-300/60',

    // Subtle row separator
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

    text: 'text-white',

    // Normal UI border
    border: 'border-slate-500/50',

    // Softer item/card border
    itemBorder: 'border-slate-500/30',

    // Subtle row separator
    divide: 'divide-slate-500/30',

    // CSS line color
    line: 'rgba(100, 116, 139, 0.30)',
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
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primarySelected: string;
  primaryText: string;
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
  },


  // ===================================================
  // ORANGE
  // ===================================================

  orange: {
    primary: '#E98A3A',
    primaryHover: '#D97A2B',
    primaryLight: '#FFF3E8',
    primarySelected: '#FFE5D0',
    primaryText: '#C96F25',
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
  },
};