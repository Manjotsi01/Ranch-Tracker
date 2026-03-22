// client/src/components/ui/Modal.tsx
import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative w-full rounded-2xl border border-agri-800/40 bg-surface-2 shadow-2xl',
        'animate-fade-up',
        sizes[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-agri-800/30">
          <h3 className="font-display font-semibold text-agri-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-agri-500 hover:text-agri-300 hover:bg-surface-3 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-agri-800/30 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}