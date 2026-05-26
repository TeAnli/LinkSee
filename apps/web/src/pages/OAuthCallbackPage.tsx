import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { authApi } from '@linksee/api-client';
import { useAuthStore } from '@/stores/useAuthStore';
import type { OAuthProvider } from '@linksee/shared';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState('');
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam || !code || !state) {
      setError(errorParam || '授权已取消或参数无效');
      return;
    }

    // Determine provider from state prefix (format: "github.{token}")
    const provider = state.includes('.') ? state.split('.')[0] : null;
    if (!provider || !['github', 'google', 'qq', 'discord'].includes(provider)) {
      setError('无法识别OAuth提供商');
      return;
    }

    (async () => {
      try {
        const res = await authApi.oauthLogin({
          provider: provider as OAuthProvider,
          code,
          state,
        });
        const { userInfo, token, refreshToken } = res.data.data;
        login(userInfo, token, refreshToken);
        navigate('/', { replace: true });
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? 'GitHub登录失败';
        setError(msg);
      }
    })();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <Icon icon="mdi:alert-circle-outline" width={48} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="text-sm font-semibold text-primary hover:underline"
            >
              返回登录页
            </button>
          </>
        ) : (
          <>
            <Icon icon="mdi:loading" width={32} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在登录...</p>
          </>
        )}
      </div>
    </div>
  );
}
