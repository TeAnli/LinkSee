import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi } from '@linksee/api-client';
import type { LoginRequest } from '@linksee/shared';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError(t('auth.fillAllFields'));
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { userInfo, token } = res.data.data;
      login(userInfo, token);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t('auth.loginFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="auth-blob absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full opacity-[0.07] blur-3xl"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div
          className="auth-blob-delay absolute -bottom-24 -right-24 h-[360px] w-[360px] rounded-full opacity-[0.06] blur-3xl"
          style={{ backgroundColor: 'var(--accent-fg)' }}
        />
      </div>

      {/* Dot grid overlay */}
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-30" />

      <div className="relative z-10 w-full max-w-[400px]">
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
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-flat"
              style={{
                backgroundColor: 'var(--primary)',
              }}
            >
              <Icon icon="mdi:forum" width={22} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              LinkSee
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {t('auth.signInToAccount')}
          </p>
        </motion.div>

        {/* Login card */}
        <motion.form
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          onSubmit={handleSubmit}
        >
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground"
                >
                  <Icon icon="mdi:alert-circle-outline" width={16} />
                  {error}
                </motion.div>
              )}

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-semibold">
                  {t('auth.username')}
                </label>
                <div className="relative">
                  <Icon
                    icon="mdi:account-outline"
                    width={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="username"
                    placeholder={t('auth.enterUsername')}
                    className="pl-10"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Icon
                    icon="mdi:lock-outline"
                    width={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.enterPassword')}
                    className="pl-10 pr-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    <Icon
                      icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                      width={18}
                    />
                  </button>
                </div>
              </div>

              {/* Remember me & forgot password row */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  {t('auth.rememberMe')}
                </label>
                <Link
                  to="/forgot-password"
                  className="font-semibold hover:underline text-primary"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="mt-1 h-11 w-full text-sm font-bold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="mdi:loading" width={18} className="animate-spin" />
                    {t('auth.signingIn')}
                  </span>
                ) : (
                  t('auth.signIn')
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.form>

        {/* Footer link */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mt-5 text-center text-sm font-medium text-muted-foreground"
        >
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="font-bold hover:underline text-primary">
            {t('auth.createOne')}
          </Link>
        </motion.p>

        {/* Divider with social */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-6"
        >
          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground">
              {t('auth.orContinueWith')}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-4 flex justify-center gap-3">
            {[
              { icon: 'mdi:github', label: 'GitHub' },
              { icon: 'mdi:google', label: 'Google' },
              { icon: 'mdi:wechat', label: 'WeChat' },
            ].map((s) => (
              <Button
                key={s.icon}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl"
                aria-label={s.label}
              >
                <Icon icon={s.icon} width={20} />
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
