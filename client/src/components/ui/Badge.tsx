// client/src/components/ui/Badge.tsx
import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: string
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

// All variants in one place — shop variants (red, green, blue, slate, indigo, amber) added
const variantMap: Record<string, string> = {
  // Semantic
  default:  'bg-slate-500/15 text-slate-300 border-slate-500/20',
  success:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  warning:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  danger:   'bg-red-500/15 text-red-300 border-red-500/20',
  info:     'bg-sky-500/15 text-sky-300 border-sky-500/20',
  purple:   'bg-violet-500/15 text-violet-300 border-violet-500/20',

  // Shop pages use plain colour names — mapped here so nothing crashes
  red:    'bg-red-100 text-red-700 border-red-200',
  green:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue:   'bg-blue-100 text-blue-700 border-blue-200',
  slate:  'bg-slate-100 text-slate-700 border-slate-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  amber:  'bg-amber-100 text-amber-700 border-amber-200',

  // Animal statuses
  CALF:             'bg-sky-500/15 text-sky-300 border-sky-500/20',
  WEANED_CALF:      'bg-sky-500/15 text-sky-300 border-sky-500/20',
  HEIFER:           'bg-violet-500/15 text-violet-300 border-violet-500/20',
  PREGNANT_HEIFER:  'bg-pink-500/15 text-pink-300 border-pink-500/20',
  MILKING:          'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  LACTATING:        'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  DRY:              'bg-amber-500/15 text-amber-300 border-amber-500/20',
  TRANSITION:       'bg-orange-500/15 text-orange-300 border-orange-500/20',
  SOLD:             'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  DEAD:             'bg-red-500/15 text-red-300 border-red-500/20',

  // Milk sessions
  MORNING: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  EVENING: 'bg-sky-500/15 text-sky-300 border-sky-500/20',

  // Lactation / Pregnancy
  ACTIVE:        'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  COMPLETED:     'bg-slate-500/15 text-slate-300 border-slate-500/20',
  PREGNANT:      'bg-violet-500/15 text-violet-300 border-violet-500/20',
  NOT_PREGNANT:  'bg-slate-500/15 text-slate-300 border-slate-500/20',
  UNKNOWN:       'bg-amber-500/15 text-amber-300 border-amber-500/20',

  // AI statuses
  DONE:              'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  CONFIRMED_PREGNANT: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  REPEAT:            'bg-amber-500/15 text-amber-300 border-amber-500/20',

  // Vaccine statuses
  GIVEN:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  DUE:     'bg-amber-500/15 text-amber-300 border-amber-500/20',
  OVERDUE: 'bg-red-500/15 text-red-300 border-red-500/20',

  // Season statuses
  PLANNED:   'bg-slate-500/15 text-slate-300 border-slate-500/20',
  HARVESTED: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  ABANDONED: 'bg-red-500/15 text-red-300 border-red-500/20',
  GROWING:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',

  // Fodder types
  GREEN:       'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  DRY_FODDER:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  SILAGE:      'bg-sky-500/15 text-sky-300 border-sky-500/20',
  CONCENTRATE: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  SUPPLEMENT:  'bg-slate-500/15 text-slate-300 border-slate-500/20',
}

const dotMap: Record<string, string> = {
  default: 'bg-slate-400', success: 'bg-emerald-400', warning: 'bg-amber-400',
  danger: 'bg-red-400', info: 'bg-sky-400', purple: 'bg-violet-400',
  red: 'bg-red-500', green: 'bg-emerald-500', blue: 'bg-blue-500',
}

const sizes = {
  sm: 'text-[10px] px-2 py-0.5 rounded-md',
  md: 'text-xs px-2.5 py-1 rounded-lg',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
}: BadgeProps) {
  const colorClass = variantMap[variant] ?? variantMap.default
  const dotColor   = dotMap[variant]    ?? dotMap.default

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-medium border', colorClass, sizes[size], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />}
      {children}
    </span>
  )
}

export { Badge }
