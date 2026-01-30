import { cn } from '../../utils/cn'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  as: Component = 'button',
  ...props
}) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center'
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-soft hover:shadow-medium',
    secondary: 'bg-white text-primary-500 border-2 border-primary-500 hover:bg-primary-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-soft hover:shadow-medium',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const classes = cn(baseStyles, variants[variant], sizes[size], className)

  if (Component === 'button') {
    return (
      <button
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <Component
      className={classes}
      {...props}
    >
      {children}
    </Component>
  )
}

