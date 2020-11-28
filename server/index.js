// import Rollbar from 'rollbar';
import fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pug from 'pug';
import pointOfView from 'point-of-view';
import fastifyStatic from 'fastify-static';

import addRoutes from './routes/index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const registerPlugins = (app) => {
  app.register(pointOfView, {
    engine: {
      pug,
    },
    includeViewExtension: true,
    root: path.join(dirname, 'views'),
  });
  app.register(fastifyStatic, {
    root: path.join(dirname, '..', 'assets'),
    prefix: '/assets',
  });
};

export default () => {
  // const rollbar = new Rollbar({
  //   accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  //   captureUncaught: true,
  //   captureUnhandledRejections: true,
  // });
  const configPath = path.join(dirname, '..', 'config.env');
  dotenv.config({ path: configPath });
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const app = fastify({
    logger: {
      prettyPrint: isDevelopment,
    },
    ignoreTrailingSlash: true,
  });

  registerPlugins(app);
  addRoutes(app);

  return app;
};
