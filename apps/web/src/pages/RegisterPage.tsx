import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi } from '@linksee/api-client';
import type { RegisterRequest } from '@linksee/shared';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const PASSWORD_RULES = [
    { label: t('auth.ruleMinLength'), test: (v: string) => v.length >= 8 },
    { label: t('auth.ruleContainsNumber'), test: (v: string) => /\d/.test(v) },
    { label: t('auth.ruleContainsLetter'), test: (v: string) => /[a-zA-Z]/.test(v) },
  ];

  const [form, setForm] = useState<RegisterRequest>({
    username: '',
    password: '',
    email: '',
    captcha: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaData, setCaptchaData] = useState<{
    captchaId: string;
    captchaImageBase64: string;
  } | null>(null);

  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    try {
      const res = await authApi.getCaptcha();
      console.log('Captcha data:', res.data.data);
      setCaptchaData(res.data.data);
    } catch {
      // captcha optional for now
    }
  };

  const passwordScore = PASSWORD_RULES.filter((r) => r.test(form.password)).length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password || !confirmPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (form.username.trim().length < 3) {
      setError(t('auth.usernameTooShort'));
      return;
    }
    if (passwordScore < PASSWORD_RULES.length) {
      setError(t('auth.passwordRequirements'));
      return;
    }
    if (form.password !== confirmPassword) {
      setError(t('auth.passwordsNotMatch'));
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register(form);
      const { token } = res.data.data;
      const loginRes = await authApi.login({
        username: form.username,
        password: form.password,
      });
      const { userInfo } = loginRes.data.data;
      login(userInfo, token);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t('auth.registrationFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="auth-blob-delay absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full opacity-[0.06] blur-3xl"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div
          className="auth-blob absolute -top-24 -right-24 h-[340px] w-[340px] rounded-full opacity-[0.05] blur-3xl"
          style={{ backgroundColor: 'var(--accent-fg)' }}
        />
      </div>

      {/* Dot grid overlay */}
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-30" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo / brand */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] shadow-flat"
              style={{
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary)',
              }}
            >
              <Icon icon="mdi:forum" width={22} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>
              LinkSee
            </span>
          </div>
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--muted-fg)' }}>
            {t('auth.createAccount')}
          </p>
        </motion.div>

        {/* Register card */}
        <motion.form
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          onSubmit={handleSubmit}
        >
          <Card className="!border-[1.5px]" style={{ borderColor: 'var(--border-color)' }}>
            <CardContent className="flex flex-col gap-4 p-6">
              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-destructive, #FF6B6B)',
                    color: '#fff',
                  }}
                >
                  <Icon icon="mdi:alert-circle-outline" width={16} />
                  {error}
                </motion.div>
              )}

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-username" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                  {t('auth.username')} <span style={{ color: 'var(--color-destructive, #FF6B6B)' }}>*</span>
                </label>
                <div className="relative">
                  <Icon icon="mdi:account-outline" width={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-fg)' }} />
                  <Input id="reg-username" placeholder={t('auth.chooseUsername')} className="pl-10" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" />
                </div>
                {form.username && form.username.length < 3 && (
                  <p className="text-xs font-medium" style={{ color: 'var(--color-destructive, #FF6B6B)' }}>
                    {t('auth.usernameTooShort')}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Icon icon="mdi:email-outline" width={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-fg)' }} />
                  <Input id="reg-email" type="email" placeholder={`${t('auth.enterEmail')} ${t('auth.optional')}`} className="pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-password" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                  {t('auth.password')} <span style={{ color: 'var(--color-destructive, #FF6B6B)' }}>*</span>
                </label>
                <div className="relative">
                  <Icon icon="mdi:lock-outline" width={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-fg)' }} />
                  <Input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder={t('auth.enterPassword')} className="pl-10 pr-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--muted-fg)' }} tabIndex={-1} aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}>
                    <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={18} />
                  </button>
                </div>
                {/* Password strength indicator */}
                {form.password && (
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
                        <li key={rule.label} className="flex items-center gap-1 text-xs font-medium transition-colors duration-200" style={{ color: rule.test(form.password) ? 'var(--primary)' : 'var(--muted-fg)' }}>
                          <Icon icon={rule.test(form.password) ? 'mdi:check-circle' : 'mdi:circle-outline'} width={12} />
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-confirm" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                  {t('auth.confirmPassword')} <span style={{ color: 'var(--color-destructive, #FF6B6B)' }}>*</span>
                </label>
                <div className="relative">
                  <Icon icon="mdi:lock-check-outline" width={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-fg)' }} />
                  <Input id="reg-confirm" type={showPassword ? 'text' : 'password'} placeholder={t('auth.enterPassword')} className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </div>
                {confirmPassword && form.password !== confirmPassword && (
                  <p className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-destructive, #FF6B6B)' }}>
                    <Icon icon="mdi:close-circle" width={12} />
                    {t('auth.passwordsNotMatch')}
                  </p>
                )}
                {confirmPassword && form.password === confirmPassword && (
                  <p className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }}>
                    <Icon icon="mdi:check-circle" width={12} />
                    {t('auth.passwordsMatch')}
                  </p>
                )}
              </div>

              {/* Captcha */}
              {captchaData && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-captcha" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                    {t('auth.captcha')}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input id="reg-captcha" placeholder={t('auth.enterCaptcha')} value={form.captcha} onChange={(e) => setForm({ ...form, captcha: e.target.value })} autoComplete="off" />
                    </div>
                    <button type="button" onClick={loadCaptcha} className="h-10 rounded-xl border-[1.5px] overflow-hidden hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--border-color)' }} title={t('auth.clickToRefresh')}>
                      {captchaData.captchaImageBase64 ? (
                        <img src={`${captchaData.captchaImageBase64}`} alt="Captcha" className="h-full w-full" />
                      ) : (
                        <div className="flex h-full w-24 items-center justify-center text-xs font-semibold" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-fg)' }}>
                          {t('common.loading')}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer text-xs leading-relaxed" style={{ color: 'var(--muted-fg)' }}>
                <input type="checkbox" className="mt-0.5 size-3.5 rounded accent-[var(--primary)]" />
                <span>
                  {t('auth.agreeTo')}{' '}
                  <button type="button" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                    {t('auth.termsOfService')}
                  </button>{' '}
                  {t('auth.and')}{' '}
                  <button type="button" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                    {t('auth.privacyPolicy')}
                  </button>
                </span>
              </label>

              {/* Submit */}
              <Button type="submit" className="mt-1 h-11 w-full text-sm font-bold" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="mdi:loading" width={18} className="animate-spin" />
                    {t('auth.creatingAccount')}
                  </span>
                ) : (
                  t('auth.signUp')
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.form>

        {/* Footer link */}
        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mt-5 text-center text-sm font-medium" style={{ color: 'var(--muted-fg)' }}>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>
            {t('auth.signIn')}
          </Link>
        </motion.p>

        {/* Divider with social */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="mt-6">
          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--muted-fg)' }}>
              {t('auth.orContinueWith')}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
          <div className="mt-4 flex justify-center gap-3">
            {[
              { icon: 'mdi:github', label: 'GitHub' },
              { icon: 'mdi:google', label: 'Google' },
              { icon: 'mdi:wechat', label: 'WeChat' },
            ].map((s) => (
              <Button key={s.icon} variant="outline" size="icon" className="h-10 w-10 rounded-xl" aria-label={s.label}>
                <Icon icon={s.icon} width={20} />
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
