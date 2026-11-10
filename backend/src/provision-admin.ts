import { z } from 'zod';
import argon2 from 'argon2';
import { config } from './config.js';
import { db } from './db.js';
if (config.NODE_ENV !== 'development')
  throw new Error('Admin provisioning is development-only');
const input = z
  .object({
    ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
    ADMIN_PASSWORD: z.string().min(16).max(128),
  })
  .parse(process.env);
try {
  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.ADMIN_EMAIL,
        name: 'Development Administrator',
        role: 'ADMIN',
        passwordHash: await argon2.hash(input.ADMIN_PASSWORD, {
          type: argon2.argon2id,
        }),
      },
    });
    await tx.auditEvent.create({
      data: { userId: user.id, action: 'DEV_ADMIN_CREATED' },
    });
  });
  console.log('Development administrator created.');
} finally {
  await db.$disconnect();
}
