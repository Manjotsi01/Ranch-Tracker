// Path: ranch-tracker/client/src/components/ui/Button.tsx

import { forwardRef, type ButtonHTMLAttributes,type  ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

 
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer select-none font-display tracking-wide disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-95',
    secondary: 'bg-[#1e2328] hover:bg-[#252b32] text-[#f0f2f4] border border-[#2a2f36] active:scale-95',
    ghost: 'hover:bg-white/5 text-[#8a9099] hover:text-[#f0f2f4] active:scale-95',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 active:scale-95',
    outline: 'border border-[#2a2f36] hover:border-[#3a4046] text-[#8a9099] hover:text-[#f0f2f4] active:scale-95',
  };

  const sizes = {
    sm: 'h-7 px-3 text-xs rounded-md',
    md: 'h-9 px-4 text-sm rounded-lg',
    lg: 'h-11 px-6 text-sm rounded-xl',
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon && (
        <span className="mr-2 flex items-center">
          {leftIcon}
        </span>
      )}
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children}
      {rightIcon && (
        <span className="ml-2 flex items-center">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;

export { Button };
