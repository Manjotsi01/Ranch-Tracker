// Path: ranch-tracker/client/src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn (...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const formatLiters = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return '0.0 L';
  return `${value.toFixed(1)} L`
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatDate(dateStr: string, fmt = 'd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function getTrendColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-slate-400';
}

export function getModuleColor(module: string): string {
  const map: Record<string, string> = {
    agriculture: '#4ade80',
    dairy: '#38bdf8',
    poultry: '#fb923c',
    shop: '#fbbf24',
    machinery: '#94a3b8',
    labour: '#a78bfa',
    reports: '#64748b',
    inventory: '#34d399',
  };
  return map[module.toLowerCase()] ?? '#64748b';
}

export function getModuleBg(module: string): string {
  const map: Record<string, string> = {
    agriculture: 'bg-emerald-500/10 border-emerald-500/20',
    dairy: 'bg-sky-500/10 border-sky-500/20',
    shop: 'bg-amber-500/10 border-amber-500/20',
  };
  return map[module.toLowerCase()] ?? 'bg-slate-500/10 border-slate-500/20';
}

export function getAlertColor(type: string) {
  switch (type) {
    case 'danger': return { border: 'border-red-500/30', bg: 'bg-red-500/8', dot: 'bg-red-400', text: 'text-red-300' };
    case 'warning': return { border: 'border-amber-500/30', bg: 'bg-amber-500/8', dot: 'bg-amber-400', text: 'text-amber-300' };
    case 'info': return { border: 'border-sky-500/30', bg: 'bg-sky-500/8', dot: 'bg-sky-400', text: 'text-sky-300' };
    case 'success': return { border: 'border-emerald-500/30', bg: 'bg-emerald-500/8', dot: 'bg-emerald-400', text: 'text-emerald-300' };
    default: return { border: 'border-slate-500/30', bg: 'bg-slate-500/8', dot: 'bg-slate-400', text: 'text-slate-300' };
  }
}


export const formatDateRange = (start: string, end: string): string => {
  return `${formatDate(start)} – ${formatDate(end)}`;
};


export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    PLANNED:   'bg-slate-500/20 text-slate-300 border-slate-500/30',
    ACTIVE:    'bg-agri-500/20 text-agri-300 border-agri-500/30',
    HARVESTED: 'bg-harvest-500/20 text-harvest-300 border-harvest-500/30',
    COMPLETED: 'bg-agri-700/20 text-agri-400 border-agri-700/30',
    ABANDONED: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return map[status] ?? 'bg-slate-500/20 text-slate-300';
};

export const expenseCategoryColor = (cat: string): string => {
  const map: Record<string, string> = {
    LAND_PREP:    'text-soil-400',
    SEEDS:        'text-agri-400',
    FERTILIZER:   'text-harvest-400',
    IRRIGATION:   'text-blue-400',
    LABOR:        'text-purple-400',
    PEST_CONTROL: 'text-red-400',
    HARVESTING:   'text-orange-400',
    TRANSPORT:    'text-cyan-400',
    OTHER:        'text-slate-400',
  };
  return map[cat] ?? 'text-slate-400';
};

/** Format datetime string */
export const formatDateTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

/** Days until expiry (positive = future, negative = expired) */
export const daysUntil = (dateStr: string): number => {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/** Product display name map */
export const PRODUCT_LABELS: Record<string, string> = {
  PANEER: 'Paneer',
  GHEE: 'Ghee',
  DAHI: 'Dahi',
  BUTTER: 'Butter',
  MAKKAN: 'Makkan',
  KHOYA: 'Khoya',
  CREAM: 'Cream',
  LASSI: 'Lassi',
  KULFI: 'Kulfi',
  KHEER: 'Kheer',
  ICE_CREAM: 'Ice Cream',
  HOT_MILK: 'Flavored Hot Milk',
  BAKERY: 'Bakery',
  CHAAT: 'Chaat',
  RESTAURANT: 'Restaurant',
}

export const getProductLabel = (type: string): string =>
  PRODUCT_LABELS[type] ?? type

/** Payment mode badge colors */
export const PAYMENT_COLORS: Record<string, string> = {
  CASH: 'green',
  UPI: 'blue',
  CARD: 'indigo',
  CREDIT: 'amber',
}

/** Batch status badge styles */
export const BATCH_STATUS_STYLES: Record<string, string> = {
  PROCESSING: 'bg-amber-100 text-amber-700 border-amber-200',
  READY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  EXPIRED: 'bg-red-100 text-red-700 border-red-200',
}

/** Calculate gross margin % */
export const marginPct = (cost: number, price: number): number =>
  price > 0 ? Math.round(((price - cost) / price) * 100) : 0

/** Clamp a value between min and max */
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max)

/** Generate a simple local ID for cart items */
export const uid = (): string =>
  Math.random().toString(36).slice(2, 10)
