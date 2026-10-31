/**
 * Reusable Button Component
 */

export function Button({
  label,
  icon = null,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  onClick = null,
  classes = '',
  disabled = false,
  type = 'button'
}) {
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-container text-on-primary shadow-sm',
    secondary: 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface shadow-sm border border-outline-variant/30',
    danger: 'bg-error hover:bg-error/90 text-on-error shadow-sm',
    ghost: 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-label-sm gap-1',
    md: 'px-3.5 py-2 text-label-md gap-1.5',
    lg: 'px-4 py-2.5 text-body-md gap-2'
  };

  const iconMarkup = icon
    ? `<span class="material-symbols-outlined text-[18px]">${icon}</span>`
    : '';

  return `
    <button
      type="${type}"
      class="inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${classes}"
      ${disabled ? 'disabled' : ''}
    >
      ${iconMarkup}
      <span>${label}</span>
    </button>
  `;
}

