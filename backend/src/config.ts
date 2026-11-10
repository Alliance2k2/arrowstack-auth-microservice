import 'dotenv/config';
import { z } from 'zod';

const environment = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (value) => /^postgres(ql)?:/.test(value),
        'PostgreSQL URL required',
      ),
    JWT_SECRET: z.string().min(48),
    WEB_ORIGIN: z.string().url().default('http://127.0.0.1:5173'),
  })
  .safeParse(process.env);
if (!environment.success)
  throw new Error(
    'Invalid environment: ' +
      environment.error.issues
        .map((i) => i.path.join('.') + ': ' + i.message)
        .join('; '),
  );
export const config = environment.data;
if (
  config.NODE_ENV === 'production' &&
  !config.WEB_ORIGIN.startsWith('https://')
) {
  throw new Error('Production WEB_ORIGIN requires HTTPS');
}
