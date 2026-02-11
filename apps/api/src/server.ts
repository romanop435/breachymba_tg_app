import { buildApp } from './app.js';
import { env } from './lib/env.js';

const app = buildApp();

app.listen({ port: env.port, host: '0.0.0.0' })
  .then(() => {
    console.log(`API running on :${env.port}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
