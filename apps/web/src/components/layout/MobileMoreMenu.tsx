import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ColorPicker } from '@/components/theme/ColorPicker';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { useAuthStore } from '@/stores/useAuthStore';
import { userApi } from '@linksee/api-client/user';
import { mockNotifications, formatRelativeTime } from '@/mock/data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MobileMoreMenu() {
  const { t, i18n } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label={t('common.more')}
        >
          <Icon icon="mdi:dots-horizontal" width={20} height={20} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[340px] max-h-[80vh] overflow-y-auto p-0 border-[1.5px] shadow-flat-lg rounded-xl"
      >
        {/* Check-in */}
        <CheckInSection onClose={() => setOpen(false)} />

        <Separator />

        {/* Notifications */}
        <NotificationSection />

        <Separator />

        {/* Theme */}
        <div className="px-4 py-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {t('settings.appearance')}
          </h4>
          <ColorPicker />
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">{t('settings.themeMode')}</span>
            <DarkModeToggle />
          </div>
        </div>

        <Separator />

        {/* Language */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              <Icon icon="mdi:translate" width={14} height={14} className="inline mr-1.5 text-muted-foreground" />
              Language
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => i18n.changeLanguage('zh-CN')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                  i18n.language === 'zh-CN'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                  i18n.language === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CheckInSection({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    pointsEarned: number;
    consecutiveDays: number;
  } | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const handleCheckIn = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await userApi.checkIn();
      const data = res.data.data as { pointsEarned: number; consecutiveDays: number };
      setResult({ pointsEarned: data.pointsEarned, consecutiveDays: data.consecutiveDays });
      setAlreadyDone(false);
      toast.success(t('checkin.success', { days: data.consecutiveDays }));
      setTimeout(() => onClose(), 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { code?: number } } };
      if (axiosErr?.response?.data?.code === 40101) {
        setAlreadyDone(true);
        toast.info(t('checkin.alreadyCheckedIn'));
      } else {
        toast.error(t('checkin.failed'));
      }
    } finally {
      setChecking(false);
    }
  }, [checking, t, onClose]);

  const hasChecked = alreadyDone || result !== null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {t('checkin.title')}
        </h4>
        {hasChecked && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {t('checkin.checkedInToday')}
          </span>
        )}
      </div>

      {!isAuthenticated ? (
        <p className="text-xs text-muted-foreground py-2">{t('checkin.loginToCheckIn')}</p>
      ) : hasChecked ? (
        <div className="flex items-center gap-3 py-1">
          <Icon icon="mdi:check-circle" width={28} height={28} className="text-emerald-500" />
          <div>
            <p className="text-sm font-bold text-foreground">
              {result ? `+${result.pointsEarned} ${t('checkin.pointsEarned')}` : t('checkin.checkedInToday')}
            </p>
            {result && (
              <p className="text-[11px] text-muted-foreground">
                {t('checkin.consecutiveDays')}: {result.consecutiveDays}
              </p>
            )}
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          className="w-full font-bold"
          onClick={handleCheckIn}
          disabled={checking}
        >
          {checking ? (
            <Icon icon="mdi:loading" width={16} height={16} className="animate-spin mr-1.5" />
          ) : (
            <Icon icon="mdi:calendar-check" width={16} height={16} className="mr-1.5" />
          )}
          {checking ? t('common.loading') : t('checkin.checkInNow')}
        </Button>
      )}
    </div>
  );
}

function NotificationSection() {
  const { t } = useTranslation();
  const recentNotifications = mockNotifications.slice(0, 3);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {t('noti.title')}
        </h4>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-auto">
            {unreadCount}
          </Badge>
        )}
      </div>

      {recentNotifications.length > 0 ? (
        <div className="flex flex-col gap-1">
          {recentNotifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-2.5 px-2 py-1.5 rounded-lg text-xs',
                n.isRead ? 'text-muted-foreground' : 'text-foreground bg-primary/5'
              )}
            >
              <Icon
                icon={n.type === 'system' ? 'mdi:cog-outline' : n.type === 'ai' ? 'mdi:robot-happy-outline' : 'mdi:account-heart'}
                width={16}
                height={16}
                className="shrink-0 mt-0.5 text-muted-foreground"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{n.title}</p>
                <p className="text-[10px] line-clamp-1">{n.content}</p>
                <span className="text-[10px] text-muted-foreground/70">{formatRelativeTime(n.createdAt)}</span>
              </div>
              {!n.isRead && <span className="shrink-0 size-1.5 rounded-full bg-primary mt-1.5" />}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2">{t('noti.empty')}</p>
      )}
    </div>
  );
}
