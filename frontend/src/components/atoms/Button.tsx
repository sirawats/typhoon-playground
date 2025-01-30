type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const styles = {
    base: 'rounded-md font-medium transition-colors',
    primary: 'bg-primary text-white hover:bg-focus',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700',
    tertiary:
      'bg-transparent text-white border border-white hover:text-primary hover:border-primary',
    ghost: 'bg-transparent text-white hover:text-primary',
    sizes: {
      sm: 'text-btn-sm',
      md: 'text-btn',
      lg: 'text-btn',
    },
  };

  return (
    <button
      className={`${styles.base} ${styles[variant]} ${styles.sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
