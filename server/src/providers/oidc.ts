import { Provider } from './index';

export async function exchangeCodeForToken(provider: Provider, code: string) {
  // Mock exchange: produce fake id_token and access_token
  // In real implementation use `openid-client` to exchange code
  return {
    access_token: `access_${provider.id}_${code}`,
    id_token: `id_${provider.id}_${code}`,
    refresh_token: `refresh_${provider.id}_${code}`
  };
}
