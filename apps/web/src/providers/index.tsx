import { StrictMode } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

type ProvidersProps = { children: React.ReactNode };

export function AppProviders({ children }: ProvidersProps) {
  return (
    <StrictMode>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </StrictMode>
  );
}

export function composeProviders(...providers: React.ComponentType<ProvidersProps>[]) {
  return function ComposedProviders({ children }: ProvidersProps) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}
