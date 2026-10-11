export type ButtonVariant = 'secondary' | 'primary' | 'destructive' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'icon-xs';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isActive?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'xs',
  isActive = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 select-none';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    'icon-xs': 'h-7 w-7 p-0 text-xs shrink-0',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    secondary: 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white',
    primary: 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/80 text-amber-300 hover:text-amber-200',
    destructive: 'bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 text-red-400 hover:text-red-300',
    ghost: 'bg-transparent hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white',
  };

  const activeClasses = isActive
    ? 'border-amber-500/80 bg-amber-500/20 text-amber-300 ring-1 ring-amber-500'
    : '';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled ? 'true' : undefined}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${activeClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
