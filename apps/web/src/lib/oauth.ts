import { OAuthProvider, OAuthProviderInfo, OAuthStateItem } from '@linksee/shared';

export const defaultOAuthProviders: OAuthProviderInfo[] = [
  {
    provider: 'github',
    name: 'GitHub',
    icon: 'mdi:github',
    color: '#24292e',
    enabled: true,
  },
  {
    provider: 'qq',
    name: 'QQ',
    icon: 'mdi:qqchat',
    color: '#12b7f5',
    enabled: true,
  },
];

export function generateOAuthState(provider: OAuthProvider): OAuthStateItem {
  const state = `${provider}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  return {
    state,
    provider,
    createdAt: Date.now(),
  };
}

export function saveOAuthState(item: OAuthStateItem): void {
  const states = getOAuthStates().filter((s) => Date.now() - s.createdAt < 300000);
  states.push(item);
  localStorage.setItem('oauth_states', JSON.stringify(states));
}

export function getOAuthStates(): OAuthStateItem[] {
  try {
    const raw = localStorage.getItem('oauth_states');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function validateAndRemoveOAuthState(state: string, provider: OAuthProvider): boolean {
  const states = getOAuthStates();
  const found = states.find((s) => s.state === state && s.provider === provider);
  if (found) {
    const filtered = states.filter((s) => s.state !== state);
    localStorage.setItem('oauth_states', JSON.stringify(filtered));
  }
  return !!found;
}

export function openOAuthPopup(provider: OAuthProvider, authorizeUrl: string): Window | null {
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    authorizeUrl,
    `oauth-${provider}`,
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
  );
}
