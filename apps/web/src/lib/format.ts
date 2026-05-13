import i18n from '@/i18n';

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  const { t } = i18n;

  if (diffMin < 1) return t('time.justNow');
  if (diffMin < 60) return t('time.minutesAgo', { count: diffMin });
  if (diffHour < 24) return t('time.hoursAgo', { count: diffHour });
  if (diffDay < 30) return t('time.daysAgo', { count: diffDay });
  return date.toLocaleDateString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US');
}

export function formatCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}
