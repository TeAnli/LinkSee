import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 px-4">
      {/* Decorative icon */}
      <div className="relative">
        <div className="size-20 rounded-[var(--radius-xl)] bg-destructive/10 flex items-center justify-center">
          <Icon icon="mdi:alert-circle-outline" width={40} height={40} className="text-destructive" />
        </div>
        <div className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive flex items-center justify-center">
          <Icon icon="mdi:close" width={12} height={12} className="text-destructive-foreground" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center max-w-md">
        <h2 className="text-lg font-extrabold text-foreground mb-2">
          {t('error.title')}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('error.description')}
        </p>
        {error?.message && (
          <pre className="mt-3 p-3 rounded-[var(--radius-md)] bg-muted text-xs text-muted-foreground text-left overflow-auto max-h-32">
            <code>{error.message}</code>
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onReset} className="gap-1.5">
          <Icon icon="mdi:refresh" width={16} height={16} />
          {t('error.retry')}
        </Button>
        <Button onClick={() => (window.location.href = '/')} className="gap-1.5">
          <Icon icon="mdi:home-outline" width={16} height={16} />
          {t('error.goHome')}
        </Button>
      </div>
    </div>
  );
}
