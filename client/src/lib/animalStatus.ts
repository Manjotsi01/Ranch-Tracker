// client/src/lib/animalStatus.ts
// Single source of truth for animal status display config.
// Import from here — never copy-paste into AnimalList or AnimalDetail.

export const ALL_STAGES = [
  { value: 'CALF',            label: 'Calf'             },
  { value: 'WEANED_CALF',     label: 'Weaned Calf'      },
  { value: 'HEIFER',          label: 'Heifer'           },
  { value: 'PREGNANT_HEIFER', label: 'Pregnant Heifer'  },
  { value: 'LACTATING',       label: 'Lactating'        },
  { value: 'MILKING',         label: 'Milking'          },
  { value: 'DRY',             label: 'Dry Cow'          },
  { value: 'TRANSITION',      label: 'Transition Cow'   },
  { value: 'SOLD',            label: 'Sold'             },
  { value: 'DEAD',            label: 'Dead'             },
] as const

export const STATUS_DOT: Record<string, string> = {
  CALF:            '#3b82f6',
  WEANED_CALF:     '#60a5fa',
  HEIFER:          '#8b5cf6',
  PREGNANT_HEIFER: '#ec4899',
  LACTATING:       '#10b981',
  MILKING:         '#10b981',
  DRY:             '#f59e0b',
  TRANSITION:      '#f97316',
  SOLD:            '#22c55e',
  DEAD:            '#ef4444',
}

export const STATUS_BG: Record<string, string> = {
  CALF:            '#eff6ff',
  WEANED_CALF:     '#dbeafe',
  HEIFER:          '#f5f3ff',
  PREGNANT_HEIFER: '#fdf2f8',
  LACTATING:       '#ecfdf5',
  MILKING:         '#ecfdf5',
  DRY:             '#fefce8',
  TRANSITION:      '#fff7ed',
  SOLD:            '#f0fdf4',
  DEAD:            '#fef2f2',
}

export const STATUS_TEXT: Record<string, string> = {
  CALF:            '#1e3a8a',
  WEANED_CALF:     '#1e40af',
  HEIFER:          '#4c1d95',
  PREGNANT_HEIFER: '#831843',
  LACTATING:       '#065f46',
  MILKING:         '#065f46',
  DRY:             '#78350f',
  TRANSITION:      '#7c2d12',
  SOLD:            '#14532d',
  DEAD:            '#7f1d1d',
}

export const STATUS_LABEL: Record<string, string> = {
  CALF:            'Calf',
  WEANED_CALF:     'Weaned Calf',
  HEIFER:          'Heifer',
  PREGNANT_HEIFER: 'Pregnant Heifer',
  LACTATING:       'Lactating',
  MILKING:         'Milking',
  DRY:             'Dry Cow',
  TRANSITION:      'Transition Cow',
  SOLD:            'Sold',
  DEAD:            'Dead',
}

/** Returns inline style props for a status badge */
export function getStatusStyle(status: string) {
  return {
    dot:  STATUS_DOT[status]  ?? '#94a3b8',
    bg:   STATUS_BG[status]   ?? '#f8fafc',
    text: STATUS_TEXT[status] ?? '#475569',
    label: STATUS_LABEL[status] ?? status,
  }
}
