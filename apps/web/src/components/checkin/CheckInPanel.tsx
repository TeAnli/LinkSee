import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuthStore } from '@/stores/useAuthStore';
import { userApi } from '@linksee/api-client/user';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export function CheckInPanel() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkInData, setCheckInData] = useState<{
    pointsEarned: number;
    consecutiveDays: number;
    totalPoints: number;
  } | null>(null);
  const [alreadyChecked, setAlreadyChecked] = useState(false);

  const todayIndex = new Date().getDay();
  const normalizedToday = todayIndex === 0 ? 6 : todayIndex - 1;

  const handleCheckIn = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await userApi.checkIn();
      const data = res.data.data;
      setCheckInData(data);
      setAlreadyChecked(false);
      toast.success(t('checkin.success', { days: data.consecutiveDays }));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { code?: number } } };
      if (axiosErr?.response?.data?.code === 40101) {
        setAlreadyChecked(true);
        toast.info(t('checkin.alreadyCheckedIn'));
      } else {
        toast.error(t('checkin.failed'));
      }
    } finally {
      setChecking(false);
    }
  }, [checking, t]);

  const hasCheckedToday = alreadyChecked || checkInData !== null;

  const checkedDays: boolean[] = WEEKDAYS.map((_, i) => {
    if (checkInData) {
      const start = normalizedToday - checkInData.consecutiveDays + 1;
      return i >= start && i <= normalizedToday;
    }
    if (alreadyChecked) {
      return i === normalizedToday;
    }
    return false;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('nav.checkin')}
        >
          <Icon icon="mdi:calendar-check" width={20} height={20} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[340px] p-0 overflow-hidden border-[1.5px] shadow-flat-lg rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-extrabold text-foreground">
            {t('checkin.title')}
          </h3>
          {hasCheckedToday && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {t('checkin.checkedInToday')}
            </span>
          )}
        </div>

        <Separator />

        {!isAuthenticated ? (
          /* Not logged in */
          <div className="flex flex-col items-center py-10 px-4 gap-3">
            <Icon icon="mdi:calendar-lock-outline" width={40} height={40} className="text-muted-foreground opacity-40" />
            <p className="text-xs font-bold text-muted-foreground">{t('checkin.loginToCheckIn')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 px-4 gap-4">
            {/* Check-in button */}
            {!hasCheckedToday ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="text-base font-extrabold px-8 py-5 h-auto rounded-2xl shadow-flat"
                  onClick={handleCheckIn}
                  disabled={checking}
                >
                  {checking ? (
                    <>
                      <Icon icon="mdi:loading" width={20} height={20} className="animate-spin mr-2" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:calendar-check" width={20} height={20} className="mr-2" />
                      {t('checkin.checkInNow')}
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center size-16 rounded-full bg-emerald-500/10"
              >
                <Icon icon="mdi:check-circle" width={36} height={36} className="text-emerald-500" />
              </motion.div>
            )}

            {/* Result */}
            <AnimatePresence>
              {checkInData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <p className="text-2xl font-extrabold text-primary">+{checkInData.pointsEarned}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">{t('checkin.pointsEarned')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="flex items-center gap-2 bg-amber-500/10 rounded-xl px-3 py-2.5">
                <Icon icon="mdi:fire" width={20} height={20} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-lg font-extrabold leading-none">
                    {checkInData?.consecutiveDays ?? (alreadyChecked ? '?' : 0)}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground">{t('checkin.consecutiveDays')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/10 rounded-xl px-3 py-2.5">
                <Icon icon="mdi:star-circle" width={20} height={20} className="text-purple-500 shrink-0" />
                <div>
                  <p className="text-lg font-extrabold leading-none">{checkInData?.totalPoints ?? '-'}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">{t('checkin.totalPoints')}</p>
                </div>
              </div>
            </div>

            {/* Weekly calendar */}
            <div className="w-full">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {t('checkin.weeklyStreak')}
              </p>
              <div className="flex items-center gap-1">
                {WEEKDAYS.map((day, i) => {
                  const isChecked = checkedDays[i];
                  const isToday = i === normalizedToday;
                  return (
                    <div key={day} className="flex flex-col items-center gap-0.5 flex-1">
                      <span className="text-[9px] font-semibold text-muted-foreground">
                        {t(`checkin.${day}`)}
                      </span>
                      <div
                        className={cn(
                          'flex items-center justify-center size-7 rounded-full text-[10px] font-bold transition-all duration-300',
                          isChecked && 'text-white',
                          isChecked && !isToday && 'bg-emerald-500',
                          isChecked && isToday && 'bg-primary shadow-md',
                          !isChecked && isToday && 'border-2 border-primary text-primary bg-primary/5',
                          !isChecked && !isToday && 'bg-muted text-muted-foreground',
                        )}
                      >
                        {isChecked ? (
                          <Icon icon="mdi:check" width={14} height={14} />
                        ) : (
                          i + 1
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Footer: bonus info */}
        <div className="px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon icon="mdi:gift-outline" width={14} height={14} />
            {t('checkin.dayReward')}
          </span>
          <span className="flex items-center gap-1">
            <Icon icon="mdi:gift" width={14} height={14} className="text-amber-500" />
            {t('checkin.streakTip')}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
