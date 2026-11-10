import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi.json' with { type: 'json' };
import type { RequestHandler, ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { config } from './config.js';
import { db } from './db.js';
import {
  ApiError,
  login,
  logout,
  refresh,
  register,
  safeUser,
  verifyAccess,
} from './auth.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.get('/api/openapi.json', (_req, res) => {
  res.json(openapi);
});
// Swagger's inline bootstrap requires a separate CSP; API responses retain Helmet defaults.
app.use(
  '/api/docs',
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(openapi),
);
app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());
// Exact origin check plus a non-simple header protects cookie endpoints, including login CSRF.
app.use('/api/v1/auth', (req, _res, next) => {
  if (
    req.method !== 'GET' &&
    (req.get('origin') !== config.WEB_ORIGIN ||
      req.get('x-requested-with') !== 'arrowstack-web')
  )
    return next(new ApiError(403, 'Untrusted request origin'));
  next();
});
app.use(
  '/api/v1/auth',
  rateLimit({
    windowMs: 15 * 60_000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(new ApiError(429, 'Too many attempts; try again later')),
  }),
);
const email = z.string().trim().toLowerCase().email().max(254);
const registration = z
  .object({
    email,
    name: z.string().trim().min(2).max(80),
    password: z.string().min(12).max(128),
  })
  .strict();
const credentials = z
  .object({ email, password: z.string().min(1).max(128) })
  .strict();
const cookie = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
};
const setRefresh = (res: express.Response, value: string) =>
  res.cookie('refresh', value, { ...cookie, maxAge: 7 * 86400_000 });
const requireUser: RequestHandler = async (req, res, next) => {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer '))
    throw new ApiError(401, 'Authentication required');
  let id: string;
  try {
    id = verifyAccess(authorization.slice(7));
  } catch {
    throw new ApiError(401, 'Authentication required');
  }
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(401, 'Authentication required');
  res.locals.user = user;
  next();
};
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'arrowstack-auth' });
});
app.get('/api/v1/ready', async (_req, res) => {
  await db.$queryRaw`SELECT 1`;
  res.json({ status: 'ready' });
});
app.post('/api/v1/auth/register', async (req, res) => {
  res
    .status(201)
    .json({ data: { user: await register(registration.parse(req.body)) } });
});
app.post('/api/v1/auth/login', async (req, res) => {
  const input = credentials.parse(req.body);
  const result = await login(input.email, input.password);
  setRefresh(res, result.refreshToken);
  res.json({ data: { user: result.user, accessToken: result.accessToken } });
});
app.post('/api/v1/auth/refresh', async (req, res) => {
  try {
    if (typeof req.cookies.refresh !== 'string')
      throw new ApiError(401, 'Session expired; please log in');
    const result = await refresh(req.cookies.refresh);
    setRefresh(res, result.refreshToken);
    res.json({ data: { accessToken: result.accessToken } });
  } catch (error) {
    res.clearCookie('refresh', cookie);
    throw error;
  }
});
app.post('/api/v1/auth/logout', async (req, res) => {
  await logout(
    typeof req.cookies.refresh === 'string' ? req.cookies.refresh : undefined,
  );
  res.clearCookie('refresh', cookie);
  res.status(204).end();
});
app.get('/api/v1/users/me', requireUser, (_req, res) => {
  res.json({ data: { user: safeUser(res.locals.user) } });
});
app.get('/api/v1/admin/users', requireUser, async (req, res) => {
  if (res.locals.user.role !== 'ADMIN')
    throw new ApiError(403, 'Administrator access required');
  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(10_000)
    .default(1)
    .parse(req.query.page);
  const [users, total] = await db.$transaction([
    db.user.findMany({
      skip: (page - 1) * 20,
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count(),
  ]);
  res.json({ data: { users: users.map(safeUser), total, page } });
});
app.use((_req, _res, next) => next(new ApiError(404, 'Route not found')));
const errors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: {
        message: 'Invalid input',
        fields: error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }
  const status =
    error instanceof ApiError
      ? error.status
      : error instanceof SyntaxError
        ? 400
        : error?.type === 'entity.too.large'
          ? 413
          : 500;
  res.status(status).json({
    error: {
      message:
        error instanceof ApiError
          ? error.message
          : status === 400
            ? 'Invalid JSON'
            : status === 413
              ? 'Request too large'
              : 'Internal server error',
    },
  });
};
app.use(errors);
