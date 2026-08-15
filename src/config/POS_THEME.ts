 
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

  // Muted / secondary text color
  mutedText: string;

  // Text color for light theme surfaces
  surfaceText: string;

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

    mutedText: 'text-slate-500',

    surfaceText: 'text-slate-800',

    border: 'border-slate-200',

    itemBorder: 'border-slate-200/60',

    divide: 'divide-slate-100',

    line: '#E2E8F0',
  },


  // ===================================================
  // SOFT SLATE
  // ===================================================

  softSlate: {
    name: 'Soft Slate',

    className: 'bg-slate-100',

    text: 'text-slate-800',

    mutedText: 'text-slate-500',

    surfaceText: 'text-slate-800',

    border: 'border-slate-300',

    itemBorder: 'border-slate-300/60',

    divide: 'divide-slate-200',

    line: '#CBD5E1',
  },


  // ===================================================
  // DARK SLATE
  // ===================================================

  darkSlate: {
    name: 'Dark Slate',

    className: 'bg-slate-700',

    text: 'text-white',

    mutedText: 'text-slate-200',

    // Used on light surfaces inside dark mode
    surfaceText: 'text-slate-800',

    border: 'border-slate-500/50',

    itemBorder: 'border-slate-500/30',

    divide: 'divide-slate-500/30',

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

  // =================================================
  // NEW
  // Inactive button background
  // =================================================
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

    // Inactive button
    inactive: '#6f86bd',
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

    // Inactive button
    inactive: '#7b7570',
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

    // Inactive button
    inactive: '#68827f',
  },
};
 
