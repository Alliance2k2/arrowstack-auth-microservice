import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl)
  throw new Error(
    'Set TEST_DATABASE_URL to the same dedicated local test database used by the API',
  );
const database = new URL(databaseUrl);
if (
  !['127.0.0.1', 'localhost'].includes(database.hostname) ||
  !database.pathname.endsWith('_test')
)
  throw new Error('Browser tests require an isolated local _test database');
test('register, login, restore session, profile, USER restriction and logout', async ({
  page,
}) => {
  const email = `browser-${Date.now()}@example.test`;
  const password = randomBytes(24).toString('hex');
  await page.goto('/');
  await page
    .getByRole('button', { name: 'New here? Create an account' })
    .click();
  await page.getByLabel('Full name').fill('Browser Learner');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page
    .getByRole('button', { name: 'Create account', exact: false })
    .click();
  await expect(page.getByRole('status')).toHaveText(
    'Account created. Sign in to continue.',
  );
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page
    .getByRole('button', { name: 'Sign in', exact: false })
    .first()
    .click();
  await expect(
    page.getByRole('heading', { name: 'Welcome, Browser Learner' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Administration', exact: true }),
  ).toHaveCount(0);
  const storage = await page.evaluate(() => ({
    local: localStorage.length,
    session: sessionStorage.length,
  }));
  expect(storage).toEqual({ local: 0, session: 0 });
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Welcome, Browser Learner' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your profile' }),
  ).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
});

test('development-provisioned administrator can list accounts', async ({
  page,
}) => {
  const email = `admin-${Date.now()}@example.test`;
  const password = randomBytes(24).toString('hex');
  execFileSync(process.execPath, ['../backend/dist/provision-admin.js'], {
    env: {
      ...process.env,
      NODE_ENV: 'development',
      DATABASE_URL: databaseUrl,
      JWT_SECRET: randomBytes(64).toString('hex'),
      ADMIN_EMAIL: email,
      ADMIN_PASSWORD: password,
    },
    stdio: 'pipe',
  });
  await page.goto('/');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page
    .getByRole('button', { name: 'Sign in', exact: false })
    .first()
    .click();
  await page
    .getByRole('button', { name: 'Administration', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Administration' }),
  ).toBeVisible();
  await expect(page.getByRole('table')).toContainText(email);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
});
