import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { authApi } from '@linksee/api-client';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const PASSWORD_RULES = [
  { label: 'auth.ruleMinLength', test: (v: string) => v.length >= 8 },
  { label: 'auth.ruleContainsNumber', test: (v: string) => /\d/.test(v) },
  { label: 'auth.ruleContainsLetter', test: (v: string) => /[a-zA-Z]/.test(v) },
];

type Step = 'email' | 'code' | 'success';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const passwordScore = PASSWORD_RULES.filter((r) => r.test(newPassword)).length;

  const startCooldown = useCallback(() => {
    setCooldown(60);
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('auth.enterYourEmail'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      await authApi.sendEmailCode({ email: email.trim(), type: 'reset-password' });
      setStep('code');
      startCooldown();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t('auth.failedSendResetEmail');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await authApi.sendEmailCode({ email: email.trim(), type: 'reset-password' });
      startCooldown();
    } catch {
      setError(t('auth.failedResend'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code || code.length !== 6) {
      setError(t('auth.enterEmailCode'));
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (passwordScore < PASSWORD_RULES.length) {
      setError(t('auth.passwordRequirements'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordsNotMatch'));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim(),
        code,
        newPassword,
        confirmPassword,
      });
      setStep('success');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t('auth.resetFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="auth-blob-delay absolute -top-28 -right-28 h-[380px] w-[380px] rounded-full opacity-[0.06] blur-3xl" style={{ backgroundColor: 'var(--primary)' }} />
        <div className="auth-blob absolute -bottom-20 -left-20 h-[320px] w-[320px] rounded-full opacity-[0.05] blur-3xl" style={{ backgroundColor: 'var(--accent-fg)' }} />
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
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--muted-fg)' }}>
            {step === 'success' ? t('auth.passwordUpdated') : t('auth.resetYourPassword')}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <Card className="!border-[1.5px]" style={{ borderColor: 'var(--border-color)' }}>
            <CardContent className="flex flex-col p-6">
              <AnimatePresence mode="wait">
                {step === 'email' ? (
                  <motion.form key="email-form" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }} onSubmit={handleSendCode} className="flex flex-col gap-4">
                    <div className="flex items-start gap-2.5 rounded-lg p-3 text-sm font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      <Icon icon="mdi:information-outline" width={18} className="mt-0.5 shrink-0" />
                      <span>{t('auth.resetInfo')}</span>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium" style={{ backgroundColor: 'var(--color-destructive, #FF6B6B)', color: '#fff' }}>
                        <Icon icon="mdi:alert-circle-outline" width={16} />
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reset-email" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <Icon icon="mdi:email-outline" width={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-fg)' }} />
                        <Input id="reset-email" type="email" placeholder={t('auth.enterEmail')} className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                      </div>
                    </div>

                    <Button type="submit" className="mt-1 h-11 w-full text-sm font-bold" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Icon icon="mdi:loading" width={18} className="animate-spin" />
                          {t('auth.sending')}
                        </span>
                      ) : (
                        t('auth.sendCode')
                      )}
                    </Button>
                  </motion.form>
                ) : step === 'code' ? (
                  <motion.form key="code-form" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }} onSubmit={handleReset} className="flex flex-col gap-4">
                    <div className="flex items-start gap-2.5 rounded-lg p-3 text-sm font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      <Icon icon="mdi:email-check-outline" width={18} className="mt-0.5 shrink-0" />
                      <span>{t('auth.sentResetLinkTo')} <strong>{email}</strong></span>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium" style={{ backgroundColor: 'var(--color-destructive, #FF6B6B)', color: '#fff' }}>
                        <Icon icon="mdi:alert-circle-outline" width={16} />
                        {error}
                      </div>
                    )}

                    {/* Verification code */}
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                        {t('auth.emailCode')}
                      </label>

                      <InputOTP
                        maxLength={6}
                        pattern="^[0-9]+$"
                        value={code}
                        onChange={(val) => setCode(val)}
                        containerClassName="justify-center"
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }, (_, i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className={cn(
                                'otp-slot-enter h-12 w-12 text-lg font-extrabold',
                                'border-2 border-[var(--border-color)]',
                                'first:rounded-l-xl last:rounded-r-xl',
                                'transition-all duration-200',
                                'data-[active=true]:z-10 data-[active=true]:scale-[1.04] data-[active=true]:border-[var(--primary)] data-[active=true]:shadow-flat',
                              )}
                              style={{ animationDelay: `${i * 60}ms` }}
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>

                      <Button
                        type="button"
                        variant="outline"
                        className="text-sm font-bold"
                        disabled={cooldown > 0 || loading}
                        onClick={handleResend}
                      >
                        {cooldown > 0
                          ? t('auth.resendIn', { seconds: cooldown })
                          : t('auth.resendEmail')}
                      </Button>
                    </div>

                    {/* New password */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="new-password" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                        {t('auth.newPassword')}
                      </label>
                      <div className="relative">
                        <Icon icon="mdi:lock-outline" width={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-fg)' }} />
                        <Input id="new-password" type={showPassword ? 'text' : 'password'} placeholder={t('auth.enterNewPassword')} className="pl-10 pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--muted-fg)' }} tabIndex={-1}>
                          <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={18} />
                        </button>
                      </div>
                      {newPassword && (
                        <div className="flex flex-col gap-1.5 mt-0.5">
                          <div className="flex gap-1">
                            {PASSWORD_RULES.map((_, i) => (
                              <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-300" style={{
                                backgroundColor: i < passwordScore
                                  ? passwordScore === PASSWORD_RULES.length ? 'var(--primary)' : passwordScore >= 2 ? 'var(--accent-fg)' : 'var(--color-destructive, #FF6B6B)'
                                  : 'var(--border-color)',
                              }} />
                            ))}
                          </div>
                          <ul className="flex flex-wrap gap-x-3 gap-y-0.5">
                            {PASSWORD_RULES.map((rule) => (
                              <li key={rule.label} className="flex items-center gap-1 text-xs font-medium transition-colors duration-200" style={{ color: rule.test(newPassword) ? 'var(--primary)' : 'var(--muted-fg)' }}>
                                <Icon icon={rule.test(newPassword) ? 'mdi:check-circle' : 'mdi:circle-outline'} width={12} />
                                {t(rule.label)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="confirm-password" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                        {t('auth.confirmPassword')}
                      </label>
                      <div className="relative">
                        <Icon icon="mdi:lock-check-outline" width={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-fg)' }} />
                        <Input id="confirm-password" type={showPassword ? 'text' : 'password'} placeholder={t('auth.confirmNewPassword')} className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-destructive, #FF6B6B)' }}>
                          <Icon icon="mdi:close-circle" width={12} />
                          {t('auth.passwordsNotMatch')}
                        </p>
                      )}
                      {confirmPassword && newPassword === confirmPassword && (
                        <p className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }}>
                          <Icon icon="mdi:check-circle" width={12} />
                          {t('auth.passwordsMatch')}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="mt-1 h-11 w-full text-sm font-bold" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Icon icon="mdi:loading" width={18} className="animate-spin" />
                          {t('auth.resetting')}
                        </span>
                      ) : (
                        t('auth.resetPassword')
                      )}
                    </Button>

                    <button type="button" className="text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }} onClick={() => { setStep('email'); setError(''); setCode(''); setNewPassword(''); setConfirmPassword(''); }}>
                      {t('auth.useDifferentEmail')}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-4 py-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--primary-light)' }}>
                      <Icon icon="mdi:check-circle-outline" width={32} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold" style={{ color: 'var(--fg)' }}>{t('auth.passwordUpdated')}</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--muted-fg)' }}>
                        {t('auth.passwordUpdatedDesc')}
                      </p>
                    </div>
                    <Button className="mt-1 h-11 w-full text-sm font-bold" onClick={() => navigate('/login')}>
                      {t('auth.signInNow')}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {step !== 'success' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mt-5 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              <Icon icon="mdi:arrow-left" width={16} />
              {t('auth.backToSignIn')}
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
