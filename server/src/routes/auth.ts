import { FastifyInstance } from 'fastify';
import { providers, exchangeCodeForToken } from '../providers';
import { signAccessToken, signRefreshToken } from '../tokens';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/auth/callback/:provider', async (req, reply) => {
    const provider = (req.params as any).provider as string;
    if (!providers[provider]) return reply.status(404).send({ error: 'unknown provider' });
    // Exchange code -> token (stubbed for now)
    const code = (req.query as any).code || 'devcode';
    const tokenSet = await exchangeCodeForToken(providers[provider], code);
    const accessToken = await signAccessToken({ sub: 'user:' + provider + ':1', iss: process.env.JWT_ISSUER || 'http://localhost:4000' });
    const refreshToken = await signRefreshToken({ sub: 'user:' + provider + ':1' });
    return reply.send({ ok: true, provider, tokenSet, accessToken, refreshToken });
  });

  fastify.get('/auth/start', async (req, reply) => {
    const provider = (req.query as any).provider as string;
    const redirect = (req.query as any).redirect || '/';
    if (!provider || !providers[provider]) return reply.status(400).send({ error: 'provider required' });
    const p = providers[provider];
    const state = 'state_' + Math.random().toString(36).slice(2, 10);
    const url = `${p.authorizeUrl}?client_id=CLIENT_ID&response_type=code&scope=${encodeURIComponent(p.scope||'')}&state=${state}&redirect_uri=${encodeURIComponent(redirect)}`;
    return reply.redirect(url);
  });

  fastify.post('/auth/token', async (req, reply) => {
    // rotate refresh token (stubbed)
    const body = req.body as any;
    if (!body.refreshToken) return reply.status(400).send({ error: 'refreshToken required' });
    const accessToken = await signAccessToken({ sub: 'user:rotated:1' });
    const refreshToken = await signRefreshToken({ sub: 'user:rotated:1' });
    return reply.send({ accessToken, refreshToken });
  });

  fastify.post('/auth/signout', async (req, reply) => {
    // revoke session (stubbed)
    return reply.send({ ok: true });
  });
}
