import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl)
  throw new Error(
    'Set TEST_DATABASE_URL to a dedicated local database ending in _test',
  );
const target = new URL(databaseUrl);
if (
  !['localhost', '127.0.0.1'].includes(target.hostname) ||
  !target.pathname.endsWith('_test')
)
  throw new Error('Tests require a local database ending in _test');
process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = randomBytes(64).toString('hex');
process.env.WEB_ORIGIN = 'http://127.0.0.1:5173';
const { app } = await import('../src/app.js');
const { db } = await import('../src/db.js');
const { hashToken } = await import('../src/auth.js');
const origin = process.env.WEB_ORIGIN;
const email = 'learner@example.test';
const password = randomBytes(20).toString('hex');
const post = (path: string) =>
  request(app)
    .post('/api/v1/auth/' + path)
    .set('Origin', origin)
    .set('X-Requested-With', 'arrowstack-web');
const cookie = (response: request.Response) =>
  String(response.headers['set-cookie']?.[0]).split(';')[0]!;
let token = '';
let refreshCookie = '';
beforeAll(async () => {
  await db.auditEvent.deleteMany();
  await db.refreshSession.deleteMany();
  await db.user.deleteMany();
});
afterAll(async () => {
  await db.auditEvent.deleteMany();
  await db.refreshSession.deleteMany();
  await db.user.deleteMany();
  await db.$disconnect();
});
describe('authentication with real PostgreSQL', () => {
  it('serves health and database readiness', async () => {
    expect((await request(app).get('/api/v1/health')).status).toBe(200);
    expect((await request(app).get('/api/v1/ready')).status).toBe(200);
  });
  it('rejects untrusted origin and missing CSRF header', async () => {
    expect(
      (await request(app).post('/api/v1/auth/login').send({})).status,
    ).toBe(403);
    expect(
      (
        await request(app)
          .post('/api/v1/auth/login')
          .set('Origin', origin)
          .send({})
      ).status,
    ).toBe(403);
  });
  it('validates registration and rejects self-assigned admin', async () => {
    expect(
      (
        await post('register').send({
          email: 'bad',
          name: 'A',
          password: 'short',
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await post('register').send({
          email,
          name: 'Learner',
          password,
          role: 'ADMIN',
        })
      ).status,
    ).toBe(400);
  });
  it('registers a user with a password hash and audit event', async () => {
    const response = await post('register').send({
      email: '  LEARNER@example.test ',
      name: 'Learner',
      password,
    });
    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe('USER');
    expect(response.body.data.user.passwordHash).toBeUndefined();
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    expect(user.passwordHash).not.toBe(password);
    expect(
      await db.auditEvent.count({
        where: { userId: user.id, action: 'REGISTER' },
      }),
    ).toBe(1);
  });
  it('rejects duplicates and database uniqueness violations', async () => {
    expect(
      (await post('register').send({ email, name: 'Learner', password }))
        .status,
    ).toBe(409);
    await expect(
      db.user.create({
        data: { email, name: 'Duplicate', passwordHash: 'not-used' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });
  it('rejects wrong and unknown credentials consistently', async () => {
    for (const attempt of [email, 'unknown@example.test']) {
      const response = await post('login').send({
        email: attempt,
        password: 'wrong',
      });
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Invalid email or password');
    }
  });
  it('logs in, sets protected cookie, and stores only refresh hash', async () => {
    const response = await post('login').send({ email, password });
    expect(response.status).toBe(200);
    token = response.body.data.accessToken;
    refreshCookie = cookie(response);
    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly');
    expect(response.headers['set-cookie']?.[0]).toContain('SameSite=Strict');
    const raw = refreshCookie.substring('refresh='.length);
    const session = await db.refreshSession.findFirstOrThrow();
    expect(session.tokenHash).toBe(hashToken(raw));
    expect(session.tokenHash).not.toBe(raw);
  });
  it('returns safe profile and denies USER admin access', async () => {
    const response = await request(app)
      .get('/api/v1/users/me')
      .auth(token, { type: 'bearer' });
    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(
      (
        await request(app)
          .get('/api/v1/admin/users')
          .auth(token, { type: 'bearer' })
      ).status,
    ).toBe(403);
  });
  it('rejects missing, invalid, expired and wrong-audience tokens', async () => {
    expect((await request(app).get('/api/v1/users/me')).status).toBe(401);
    for (const bad of [
      'invalid',
      jwt.sign({}, process.env.JWT_SECRET!, {
        expiresIn: -1,
        subject: 'expired',
        issuer: 'arrowstack-auth',
        audience: 'arrowstack-web',
      }),
      jwt.sign({}, process.env.JWT_SECRET!, {
        subject: 'wrong',
        issuer: 'arrowstack-auth',
        audience: 'wrong',
      }),
    ])
      expect(
        (
          await request(app)
            .get('/api/v1/users/me')
            .auth(bad, { type: 'bearer' })
        ).status,
      ).toBe(401);
  });
  it('checks current role on the server and permits ADMIN', async () => {
    await db.user.update({ where: { email }, data: { role: 'ADMIN' } });
    const response = await request(app)
      .get('/api/v1/admin/users')
      .auth(token, { type: 'bearer' });
    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(1);
    expect(
      (
        await request(app)
          .get('/api/v1/admin/users?page=invalid')
          .auth(token, { type: 'bearer' })
      ).status,
    ).toBe(400);
  });
  it('rotates refresh tokens and revokes the family on replay', async () => {
    const rotated = await post('refresh').set('Cookie', refreshCookie);
    expect(rotated.status).toBe(200);
    expect(cookie(rotated)).not.toBe(refreshCookie);
    expect((await post('refresh').set('Cookie', refreshCookie)).status).toBe(
      401,
    );
    expect((await post('refresh').set('Cookie', cookie(rotated))).status).toBe(
      401,
    );
  });
  it('rejects expired and unknown refresh tokens', async () => {
    const response = await post('login').send({ email, password });
    await db.refreshSession.updateMany({
      where: { revokedAt: null },
      data: { expiresAt: new Date(0) },
    });
    expect((await post('refresh').set('Cookie', cookie(response))).status).toBe(
      401,
    );
    expect(
      (await post('refresh').set('Cookie', 'refresh=unknown')).status,
    ).toBe(401);
    expect((await post('refresh')).status).toBe(401);
  });
  it('allows only one concurrent rotation and revokes the family', async () => {
    const response = await post('login').send({ email, password });
    const results = await Promise.all([
      post('refresh').set('Cookie', cookie(response)),
      post('refresh').set('Cookie', cookie(response)),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 401]);
    const success = results.find((r) => r.status === 200)!;
    expect((await post('refresh').set('Cookie', cookie(success))).status).toBe(
      401,
    );
  });
  it('logs out, clears cookie, and rejects refresh afterward', async () => {
    const response = await post('login').send({ email, password });
    const result = await post('logout').set('Cookie', cookie(response));
    expect(result.status).toBe(204);
    expect(String(result.headers['set-cookie'])).toContain(
      'Expires=Thu, 01 Jan 1970',
    );
    expect((await post('refresh').set('Cookie', cookie(response))).status).toBe(
      401,
    );
    expect((await post('logout')).status).toBe(204);
  });
  it('enforces session foreign keys', async () => {
    await expect(
      db.refreshSession.create({
        data: {
          userId: '00000000-0000-0000-0000-000000000000',
          familyId: '00000000-0000-0000-0000-000000000000',
          tokenHash: 'foreign-key-test',
          expiresAt: new Date(),
        },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });
  it('returns safe JSON errors for unknown routes and malformed JSON', async () => {
    expect((await request(app).get('/missing')).body.error.message).toBe(
      'Route not found',
    );
    expect(
      (await post('login').set('Content-Type', 'application/json').send('{'))
        .status,
    ).toBe(400);
  });
  it('limits authentication attempts', async () => {
    let status = 0;
    for (let i = 0; i < 65; i++) {
      status = (await post('login').send({})).status;
      if (status === 429) break;
    }
    expect(status).toBe(429);
  });
});
