import React, { createContext, useContext, useEffect, useState } from 'react';

type Session = { user: any } | null;

type AuthContextShape = {
  session: Session;
  signIn: (p: string) => void;
  signOut: () => void;
} | null;

const AuthContext = createContext<AuthContextShape>(null);

export function FeatherAuthProvider({ baseUrl, children }: { baseUrl: string; children: React.ReactNode }): JSX.Element {
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
    // hydrate session
    fetch(`${baseUrl}/auth/session`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setSession(data.user || null))
      .catch(() => setSession(null));
  }, [baseUrl]);

  const signIn = (provider: string) => {
    window.location.href = `${baseUrl}/auth/start?provider=${encodeURIComponent(provider)}&redirect=${encodeURIComponent(window.location.href)}`;
  };

  const signOut = () => {
    fetch(`${baseUrl}/auth/signout`, { method: 'POST', credentials: 'include' }).then(() => setSession(null));
  };

  return <AuthContext.Provider value={{ session, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useSession must be used inside FeatherAuthProvider');
  return { user: ctx.session?.user ?? null, signIn: ctx.signIn, signOut: ctx.signOut };
}

export function SignIn({ providers }: { providers: string[] }): JSX.Element {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('SignIn must be used inside FeatherAuthProvider');
  return (
    <div>
      {providers.map((p) => (
        <button key={p} onClick={() => ctx.signIn(p)} style={{ margin: 8 }}>
          Sign in with {p}
        </button>
      ))}
    </div>
  );
}
