import Fastify from 'fastify';
import fastify from 'fastify';
import cookie from 'fastify-cookie';
import authRoutes from './routes/auth';
import { initKeys, getJwks, verifyAccessToken } from './tokens';

const app = fastify({ logger: true });

app.register(cookie as any, {});

app.get('/', async () => ({ hello: 'openpass' }));

app.get('/.well-known/jwks.json', async () => {
  const jwks = getJwks();
  return jwks;
});

app.get('/auth/session', async (request, reply) => {
  const auth = (request.headers as any).authorization;
  if (!auth) return reply.code(401).send({ error: 'no auth' });
  const parts = auth.split(' ');
  if (parts[0] !== 'Bearer') return reply.code(401).send({ error: 'bad auth' });
  const token = parts[1];
  const payload = await verifyAccessToken(token);
  if (!payload) return reply.code(401).send({ error: 'invalid' });
  return { authenticated: true, payload };
});

app.register(authRoutes, { prefix: '/' });

const start = async () => {
  await initKeys();
  try {
    await app.listen({ port: 4000, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
