// client/src/components/ui/Badge.tsx
import { cn } from '../../lib/utils';

// Accept any string variant so dairy status codes work
interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantMap: Record<string, string> = {
  // Dashboard variants
  default:  'bg-slate-500/15 text-slate-300 border-slate-500/20',
  success:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  warning:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  danger:   'bg-red-500/15 text-red-300 border-red-500/20',
  info:     'bg-sky-500/15 text-sky-300 border-sky-500/20',
  purple:   'bg-violet-500/15 text-violet-300 border-violet-500/20',
  // Animal statuses
  CALF:     'bg-sky-500/15 text-sky-300 border-sky-500/20',
  HEIFER:   'bg-violet-500/15 text-violet-300 border-violet-500/20',
  MILKING:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  DRY:      'bg-amber-500/15 text-amber-300 border-amber-500/20',
  SOLD:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  DEAD:     'bg-red-500/15 text-red-300 border-red-500/20',
  // Milk sessions
  MORNING:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  EVENING:  'bg-sky-500/15 text-sky-300 border-sky-500/20',
  // Lactation / Pregnancy
  ACTIVE:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  COMPLETED:'bg-slate-500/15 text-slate-300 border-slate-500/20',
  PREGNANT: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  NOT_PREGNANT: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
  UNKNOWN:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  // AI statuses
  DONE:             'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  CONFIRMED_PREGNANT:'bg-violet-500/15 text-violet-300 border-violet-500/20',
  REPEAT:           'bg-amber-500/15 text-amber-300 border-amber-500/20',
  // Vaccine statuses
  GIVEN:    'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  DUE:      'bg-amber-500/15 text-amber-300 border-amber-500/20',
  OVERDUE:  'bg-red-500/15 text-red-300 border-red-500/20',
  // Fodder / Crop statuses
  PLANNED:  'bg-slate-500/15 text-slate-300 border-slate-500/20',
  GROWING:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  HARVESTED:'bg-sky-500/15 text-sky-300 border-sky-500/20',
  // Fodder types
  GREEN:      'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  DRY_FODDER: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  SILAGE:     'bg-sky-500/15 text-sky-300 border-sky-500/20',
  CONCENTRATE:'bg-violet-500/15 text-violet-300 border-violet-500/20',
  SUPPLEMENT: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
};

const dotMap: Record<string, string> = {
  default: 'bg-slate-400', success: 'bg-emerald-400', warning: 'bg-amber-400',
  danger: 'bg-red-400', info: 'bg-sky-400', purple: 'bg-violet-400',
};

const sizes = {
  sm: 'text-[10px] px-2 py-0.5 rounded-md',
  md: 'text-xs px-2.5 py-1 rounded-lg',
};

export default function Badge({
  children, variant = 'default', size = 'sm', dot = false, className,
}: BadgeProps) {
  const colorClass = variantMap[variant] ?? variantMap.default;
  const dotColor   = dotMap[variant]    ?? dotMap.default;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium border',
      colorClass, sizes[size], className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />}
      {children}
    </span>
  );
}

export { Badge };