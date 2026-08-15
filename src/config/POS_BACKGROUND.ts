export type PosBackground =
  | 'white'
  | 'softSlate'
  | 'darkSlate';

export const POS_BACKGROUNDS = {

  white: {
    name: 'White',
    className: 'bg-white',
    text: 'text-slate-800',
    mutedText: 'text-slate-500',
    border: 'border-slate-200',
  },

  softSlate: {
    name: 'Soft Slate',
    className: 'bg-slate-100',
    text: 'text-slate-800',
    mutedText: 'text-slate-500',
    border: 'border-slate-300',
  },

  darkSlate: {
    name: 'Dark Slate',
    className: 'bg-slate-700',
    text: 'text-white',
    mutedText: 'text-slate-200',
    border: 'border-slate-600',
  },

} as const;