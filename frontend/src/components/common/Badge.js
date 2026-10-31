/**
 * Status Pill & Badge Component
 */

export function Badge({
  text,
  variant = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  icon = null,
  dot = false,
  classes = ''
}) {
  const styles = {
    success: 'bg-tertiary-container/10 text-tertiary border-tertiary/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-error-container text-on-error-container border-error/20',
    info: 'bg-primary/10 text-primary border-primary/20',
    neutral: 'bg-surface-container text-on-surface-variant border-outline-variant/30'
  };

  const dotMarkup = dot
    ? `<span class="w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-tertiary animate-pulse' : variant === 'danger' ? 'bg-error' : 'bg-primary'}"></span>`
    : '';

  const iconMarkup = icon
    ? `<span class="material-symbols-outlined text-[13px]">${icon}</span>`
    : '';

  return `
    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold border ${styles[variant] || styles.neutral} ${classes}">
      ${dotMarkup}
      ${iconMarkup}
      <span>${text}</span>
    </span>
  `;
}

