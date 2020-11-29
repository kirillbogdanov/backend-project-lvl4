// import Rollbar from 'rollbar';
import fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pug from 'pug';
import pointOfView from 'point-of-view';
import fastifyStatic from 'fastify-static';
import i18next from 'i18next';

import ru from './locales/ru.js';
import en from './locales/en.js';
import getHelpers from './helpers/index.js';
import addRoutes from './routes/index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV !== 'production';

const registerPlugins = (app) => {
  const helpers = getHelpers();
  app.register(pointOfView, {
    engine: {
      pug,
    },
    defaultContext: {
      ...helpers,
      assetPath: (filename) => `/assets/${filename}`,
    },
    includeViewExtension: true,
    root: path.join(dirname, 'views'),
  });
  app.register(fastifyStatic, {
    root: path.join(dirname, '..', 'assets'),
    prefix: '/assets',
  });
};

const setUpLocalization = () => {
  i18next.init({
    lng: 'ru',
    fallbackLng: 'en',
    debug: isDevelopment,
    resources: { ru, en },
  });
};

export default () => {
  const configPath = path.join(dirname, '..', 'config.env');
  dotenv.config({ path: configPath });

  const app = fastify({
    logger: {
      prettyPrint: isDevelopment,
    },
    ignoreTrailingSlash: true,
  });

  setUpLocalization();
  registerPlugins(app);
  addRoutes(app);

  return app;
};
