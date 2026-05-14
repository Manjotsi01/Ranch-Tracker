// client/src/components/ui/Modal.tsx
// FIX: Removed auto-focus on close button which stole focus from form inputs,
//      causing the "types one character then focus jumps to close button" UX bug.
//      Focus now goes to the first focusable element that is NOT the close button.

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
  const dialogRef  = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose();

      // Tab trap — keep focus within the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handler);

    // FIX: Focus the first focusable element inside the body (inputs, selects, etc.)
    // NOT the close button. This allows the user to start typing immediately in forms.
    // We delay slightly to let the DOM paint first.
    const focusTimer = setTimeout(() => {
      if (!dialogRef.current) return;
      // Look for the first interactive element inside the scrollable body area (not header/footer)
      const body = dialogRef.current.querySelector<HTMLElement>('.modal-body');
      const firstInput = body?.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );
      if (firstInput) {
        firstInput.focus();
      } else {
        // Fallback: focus the close button only if there's nothing better
        closeBtnRef.current?.focus();
      }
    }, 60);

    return () => {
      clearTimeout(focusTimer);
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
          {/* FIX: tabIndex="-1" prevents this button from receiving focus during Tab trap
              when the user is typing in a form. It can still be clicked with the mouse,
              or reached via keyboard by shift-tabbing from the first focusable element. */}
          <button
            ref={closeBtnRef}
            onClick={onClose}
            tabIndex={-1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3a5a4a] hover:text-[#86efac] hover:bg-emerald-500/8 transition-all duration-150 flex-shrink-0 ml-3"
            aria-label="Close dialog"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable. The "modal-body" class is used by the focus logic above. */}
        <div className="modal-body px-5 py-4 overflow-y-auto flex-1 overscroll-contain">
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