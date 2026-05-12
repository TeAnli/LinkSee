import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function ResetPasswordPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="auth-blob absolute -top-28 -left-28 h-[380px] w-[380px] rounded-full opacity-[0.06] blur-3xl" style={{ backgroundColor: 'var(--primary)' }} />
        <div className="auth-blob-delay absolute -bottom-20 -right-20 h-[320px] w-[320px] rounded-full opacity-[0.05] blur-3xl" style={{ backgroundColor: 'var(--accent-fg)' }} />
      </div>

      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-30" />

      <div className="relative z-10 w-full max-w-[400px]">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] shadow-flat" style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}>
              <Icon icon="mdi:forum" width={22} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>LinkSee</span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <Card className="!border-[1.5px]" style={{ borderColor: 'var(--border-color)' }}>
            <CardContent className="flex flex-col items-center gap-4 p-6 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent)' }}>
                <Icon icon="mdi:lock-reset" width={32} style={{ color: 'var(--accent-fg)' }} />
              </div>
              <div className="text-center">
                <p className="text-base font-bold" style={{ color: 'var(--fg)' }}>{t('auth.resetYourPassword')}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted-fg)' }}>
                  {t('auth.resetLinkExpired')}
                </p>
              </div>
              <Link to="/forgot-password" className="mt-1">
                <Button className="text-sm font-bold">
                  {t('auth.requestNewLink')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mt-5 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            <Icon icon="mdi:arrow-left" width={16} />
            {t('auth.backToSignIn')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
