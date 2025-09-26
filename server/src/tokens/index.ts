import { SignJWT, jwtVerify, exportJWK, generateKeyPair } from 'jose';

let PRIVATE_KEY: CryptoKey | undefined;
let JWKS: any[] = [];
let KID = 'dev-key-1';

export async function initKeys() {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  PRIVATE_KEY = privateKey as any;
  const jwk = await exportJWK(publicKey as any);
  jwk.kid = KID;
  jwk.use = 'sig';
  jwk.alg = 'RS256';
  JWKS = [jwk];
}

export function getJwks() {
  return { keys: JWKS };
}

export async function signAccessToken(payload: object, kid = KID) {
  if (!PRIVATE_KEY) throw new Error('keys not initialized');
  const jwt = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(PRIVATE_KEY as any);
  return jwt;
}

export async function signRefreshToken(payload: object) {
  if (!PRIVATE_KEY) throw new Error('keys not initialized');
  const jwt = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(PRIVATE_KEY as any);
  return jwt;
}

export async function verifyAccessToken(token: string) {
  try {
    // build JWKS key to verify (use the first key)
    if (JWKS.length === 0) throw new Error('no jwks');
    const jwk = JWKS[0];
    // jose accepts JWK as key
    const res = await jwtVerify(token, await importKeyFromJwk(jwk), {
      algorithms: ['RS256']
    } as any);
    return res.payload;
  } catch (e) {
    return null;
  }
}

async function importKeyFromJwk(jwk: any) {
  // use jose's import/export conveniences
  const { importJWK } = await import('jose');
  return importJWK(jwk, jwk.alg || 'RS256');
}
