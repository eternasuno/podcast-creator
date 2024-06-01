import 'https://deno.land/std@0.224.0/dotenv/load.ts';

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { validator } from 'hono/validator';
import { TOKEN } from './libs/config.ts';
import bilibili from './routes/bilibili.ts';

const app = new Hono({ strict: false });

app.use(logger());

app.use(validator('query', (value, context) => {
  const token = value['token'];
  if (TOKEN && token !== TOKEN) {
    return context.text('Invalid!', 400);
  }

  return value;
}));

app.onError((error, context) => {
  console.warn(error);
  return context.text(error.message, 500);
});

app.route('/bilibili', bilibili);

Deno.serve(app.fetch);
