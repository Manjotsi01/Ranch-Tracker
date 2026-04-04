// client/src/components/ui/Input.tsx
import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/utils'

/* ─── INPUT ──────────────────────────────────────────────────────────────── */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-agri-300 tracking-wide">
            {label}
          </label>
        )}

        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border bg-surface-2 px-3 py-2',
            'border-agri-800/40 focus-within:border-agri-500/60',
            'focus-within:ring-1 focus-within:ring-agri-500/20',
            'transition-all duration-150',
            error && 'border-red-500/60 focus-within:border-red-500'
          )}
        >
          {prefix && <span className="text-agri-500 flex-shrink-0">{prefix}</span>}

          <input
            ref={ref}
            id={inputId}
            {...props}
            className={cn(
              'flex-1 bg-transparent text-sm text-agri-100',
              'placeholder:text-agri-700 outline-none min-w-0',
              className
            )}
          />

          {suffix && <span className="text-agri-500 flex-shrink-0">{suffix}</span>}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-agri-600">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

/* ─── SELECT ─────────────────────────────────────────────────────────────── */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-agri-300 tracking-wide">
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={inputId}
          {...props}
          className={cn(
            'rounded-lg border bg-surface-2 px-3 py-2 text-sm text-agri-100',
            'border-agri-800/40 focus:border-agri-500/60',
            'focus:ring-1 focus:ring-agri-500/20 outline-none',
            'transition-all duration-150 cursor-pointer',
            error && 'border-red-500/60',
            className
          )}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface-2">
              {o.label}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

/* ─── TEXTAREA ───────────────────────────────────────────────────────────── */

// Single definition — duplicate interface removed
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800',
          'placeholder:text-slate-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400',
          'transition-all duration-150',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
TextArea.displayName = 'TextArea'
