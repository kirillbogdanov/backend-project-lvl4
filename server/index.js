import express from 'express';
import morgan from 'morgan';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

export default () => {
  const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'config.env');
  dotenv.config({ path: configPath });

  const app = express();
  const logger = morgan('dev');

  const rollbar = new Rollbar({
    accessToken: 'aa024f433fcf400f9124eff4c85775f7',
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.use(logger);

  app.use((req, res) => {
    const env = process.env.NODE_ENV;
    res.send(env);
  });

  app.use(rollbar.errorHandler());

  return app;
};
