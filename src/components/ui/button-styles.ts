export type ButtonVariant = 'primary' | 'outline' | 'white' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover hover:text-white disabled:hover:bg-primary',
  outline:
    'border-[1.5px] border-dark bg-transparent text-dark hover:bg-dark hover:text-white disabled:hover:bg-transparent disabled:hover:text-dark',
  white: 'bg-white text-dark hover:bg-light hover:text-dark',
  ghost: 'bg-transparent text-primary hover:bg-light hover:text-dark',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-[9px] text-[13px]',
  md: 'px-[22px] py-3 text-sm font-bold',
  lg: 'rounded-search px-7 py-3.5 text-[15px] font-bold',
}

/** Clases de botón reutilizables también para `<Link>` / `<a>`. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  block = false,
): string {
  return [base, variants[variant], sizes[size], block ? 'w-full' : ''].filter(Boolean).join(' ')
}
