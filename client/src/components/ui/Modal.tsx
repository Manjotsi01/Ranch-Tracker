// client/src/components/ui/Modal.tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: ReactNode;
  /** Prevent closing on backdrop click */
  persistent?: boolean;
  description?: string;
}

const sizes = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-[95vw]',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  persistent = false,
  description,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  /* Keyboard & scroll lock */
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose();

      // Tab trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
      }
    };

    document.addEventListener('keydown', handler);
    // Auto-focus close button
    setTimeout(() => firstFocusRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, persistent]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 animate-fade-in"
        style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full sm:rounded-2xl rounded-t-2xl border border-white/8',
          'shadow-[0_32px_64px_rgba(0,0,0,0.6)]',
          'animate-slide-up sm:animate-scale-in',
          'flex flex-col',
          'max-h-[92dvh] sm:max-h-[85dvh]',
          sizes[size]
        )}
        style={{
          background: 'linear-gradient(180deg, #0f1820 0%, #0a1218 100%)',
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 flex-shrink-0">
          <div>
            <h2
              id="modal-title"
              className="font-display font-bold text-[#d8ede4] text-base leading-tight"
            >
              {title}
            </h2>
            {description && (
              <p id="modal-desc" className="text-xs text-[#3a5a4a] mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3a5a4a] hover:text-[#86efac] hover:bg-emerald-500/8 transition-all duration-150 flex-shrink-0 ml-3"
            aria-label="Close dialog"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-5 py-4 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-white/6 flex justify-end gap-2.5 flex-shrink-0 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}