/**
 * Reusable Metric KPI Card Component
 */

export function MetricCard({
  title,
  value,
  subvalue = '',
  delta = null,       // e.g. '+14.8%'
  deltaType = 'positive', // 'positive' | 'negative' | 'neutral'
  icon = null,
  badgeText = null,
  progress = null,     // percentage 0-100
  footerText = '',
  classes = ''
}) {
  const deltaMarkup = delta
    ? `
      <span class="inline-flex items-center text-caption-mono text-caption-mono font-semibold ${
        deltaType === 'positive' ? 'text-tertiary' : deltaType === 'negative' ? 'text-error' : 'text-secondary'
      }">
        <span class="material-symbols-outlined text-[14px]">${deltaType === 'positive' ? 'arrow_upward' : deltaType === 'negative' ? 'arrow_downward' : 'trending_flat'}</span>
        ${delta}
      </span>
    `
    : '';

  const badgeMarkup = badgeText
    ? `<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-semibold">${badgeText}</span>`
    : '';

  const iconMarkup = icon
    ? `<span class="material-symbols-outlined text-primary text-[20px]">${icon}</span>`
    : '';

  const progressMarkup = progress !== null
    ? `
      <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-2 mb-1">
        <div class="h-full bg-primary rounded-full transition-all duration-500" style="width: ${progress}%;"></div>
      </div>
    `
    : '';

  const footerMarkup = footerText
    ? `<div class="flex items-center justify-between pt-2 border-t border-surface-container/30 text-caption-mono text-caption-mono text-on-surface-variant">${footerText}</div>`
    : '';

  return `
    <div class="p-5 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${classes}">
      <div>
        <div class="flex items-center justify-between pb-2">
          <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">${title}</span>
          ${iconMarkup || badgeMarkup}
        </div>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight tabular-nums">${value}</span>
          ${subvalue ? `<span class="text-body-md font-body-md text-secondary">${subvalue}</span>` : ''}
          ${deltaMarkup}
        </div>
        ${progressMarkup}
      </div>
      ${footerMarkup}
    </div>
  `;
}

