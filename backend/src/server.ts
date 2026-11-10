import { app } from './app.js';
import { config } from './config.js';
import { db } from './db.js';

await db.$connect();
const server = app.listen(config.PORT, '0.0.0.0', () =>
  console.log(`Authentication API listening on port ${config.PORT}`),
);
server.on('error', async () => {
  await db.$disconnect();
  process.exitCode = 1;
});
function shutdown() {
  server.close(() => {
    void db.$disconnect().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
