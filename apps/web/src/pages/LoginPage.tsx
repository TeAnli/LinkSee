import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please fill in all fields');
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
          ?.message ?? 'Login failed, please try again';
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
            Sign in to your account
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
                <label
                  htmlFor="username"
                  className="text-sm font-semibold"
                  style={{ color: 'var(--fg)' }}
                >
                  Username
                </label>
                <div className="relative">
                  <Icon
                    icon="mdi:account-outline"
                    width={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-fg)' }}
                  />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    className="pl-10"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold"
                  style={{ color: 'var(--fg)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Icon
                    icon="mdi:lock-outline"
                    width={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-fg)' }}
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--muted-fg)' }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={18} />
                  </button>
                </div>
              </div>

              {/* Remember me & forgot password row */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-1.5 cursor-pointer select-none" style={{ color: 'var(--muted-fg)' }}>
                  <input
                    type="checkbox"
                    className="size-3.5 rounded accent-[var(--primary)]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  Forgot password?
                </button>
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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
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
          className="mt-5 text-center text-sm font-medium"
          style={{ color: 'var(--muted-fg)' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-bold hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Create one
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
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--muted-fg)' }}>
              OR CONTINUE WITH
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }} />
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
