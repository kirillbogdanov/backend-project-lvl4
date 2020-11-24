import express from 'express';
import morgan from 'morgan';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

export default () => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const configPath = path.join(dirname, '..', 'config.env');
  dotenv.config({ path: configPath });

  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === 'production';
  const app = express();
  const logger = morgan(isProduction ? 'common' : 'dev');

  app.use('/assets', express.static('assets'));
  app.set('views', './server/views');
  app.set('view engine', 'pug');
  app.use(logger);

  app.get('/', (req, res) => {
    res.render('index');
  });

  if (isProduction) {
    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });

    app.use(rollbar.errorHandler());
  }

  return app;
};
