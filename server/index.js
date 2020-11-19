import express from 'express';
import morgan from 'morgan';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';

export default () => {
  dotenv.config();
  const app = express();
  const logger = morgan('dev');

  const rollbar = new Rollbar({
    accessToken: 'aa024f433fcf400f9124eff4c85775f7',
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.use(logger);

  app.use((req, res) => {
    res.send('Hello!');
  });

  app.use(rollbar.errorHandler());

  return app;
};
