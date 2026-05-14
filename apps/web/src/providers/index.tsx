import { StrictMode } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/fetcher';

type ProvidersProps = { children: React.ReactNode };

export function AppProviders({ children }: ProvidersProps) {
  return (
    <StrictMode>
      <ThemeProvider>
        <SWRConfig value={swrConfig}>
          {children}
        </SWRConfig>
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
