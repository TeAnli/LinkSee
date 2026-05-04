import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { authApi } from '@linksee/api-client';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type Step = 'email' | 'sent';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setStep('sent');
      startCooldown();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to send reset email, please try again';
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
      await authApi.forgotPassword({ email: email.trim() });
      startCooldown();
    } catch {
      setError('Failed to resend, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="auth-blob-delay absolute -top-28 -right-28 h-[380px] w-[380px] rounded-full opacity-[0.06] blur-3xl"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div
          className="auth-blob absolute -bottom-20 -left-20 h-[320px] w-[320px] rounded-full opacity-[0.05] blur-3xl"
          style={{ backgroundColor: 'var(--accent-fg)' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-30" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
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
              style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Icon icon="mdi:forum" width={22} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>
              LinkSee
            </span>
          </div>
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--muted-fg)' }}>
            Reset your password
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          onSubmit={step === 'email' ? handleSubmit : undefined}
        >
          <Card className="!border-[1.5px]" style={{ borderColor: 'var(--border-color)' }}>
            <CardContent className="flex flex-col gap-4 p-6">
              <AnimatePresence mode="wait">
                {step === 'email' ? (
                  <motion.div
                    key="email-form"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Info box */}
                    <div
                      className="flex items-start gap-2.5 rounded-lg p-3 text-sm font-medium"
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
                    >
                      <Icon icon="mdi:information-outline" width={18} className="mt-0.5 shrink-0" />
                      <span>Enter the email associated with your account and we&apos;ll send you a reset link.</span>
                    </div>

                    {error && (
                      <div
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                        style={{ backgroundColor: 'var(--color-destructive, #FF6B6B)', color: '#fff' }}
                      >
                        <Icon icon="mdi:alert-circle-outline" width={16} />
                        {error}
                      </div>
                    )}

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reset-email" className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                        Email
                      </label>
                      <div className="relative">
                        <Icon
                          icon="mdi:email-outline"
                          width={18}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--muted-fg)' }}
                        />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="mt-1 h-11 w-full text-sm font-bold" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Icon icon="mdi:loading" width={18} className="animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="sent-success"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center gap-4 py-2"
                  >
                    {/* Success icon */}
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--primary-light)' }}
                    >
                      <Icon icon="mdi:email-check-outline" width={32} style={{ color: 'var(--primary)' }} />
                    </div>

                    <div className="text-center">
                      <p className="text-base font-bold" style={{ color: 'var(--fg)' }}>
                        Check your inbox
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--muted-fg)' }}>
                        We&apos;ve sent a password reset link to
                      </p>
                      <p className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                        {email}
                      </p>
                    </div>

                    {error && (
                      <div
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                        style={{ backgroundColor: 'var(--color-destructive, #FF6B6B)', color: '#fff' }}
                      >
                        <Icon icon="mdi:alert-circle-outline" width={16} />
                        {error}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-sm font-bold"
                      disabled={cooldown > 0 || loading}
                      onClick={handleResend}
                    >
                      {cooldown > 0
                        ? `Resend in ${cooldown}s`
                        : loading
                          ? 'Resending...'
                          : 'Resend Email'}
                    </Button>

                    <button
                      type="button"
                      className="text-sm font-semibold hover:underline"
                      style={{ color: 'var(--primary)' }}
                      onClick={() => { setStep('email'); setError(''); }}
                    >
                      Use a different email
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.form>

        {/* Back to login */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mt-5 text-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            <Icon icon="mdi:arrow-left" width={16} />
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
