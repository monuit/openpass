export type Provider = {
  id: string;
  name: string;
  authorizeUrl: string;
  scope?: string;
};

export const providers: Record<string, Provider> = {
  google: { id: 'google', name: 'Google', authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', scope: 'openid email profile' },
  github: { id: 'github', name: 'GitHub', authorizeUrl: 'https://github.com/login/oauth/authorize', scope: 'read:user user:email' }
};

export * from './oidc';
