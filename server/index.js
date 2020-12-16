// import Rollbar from 'rollbar';
import fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pug from 'pug';
import pointOfView from 'point-of-view';
import fastifyStatic from 'fastify-static';
import i18next from 'i18next';
import fastifyObjectionjs from 'fastify-objectionjs';
import fastifyFormbody from 'fastify-formbody';
import qs from 'qs';
import fastifyMethodOverride from 'fastify-method-override';
import fastifySecureSession from 'fastify-secure-session';
import fastifyPassport from 'fastify-passport';

import FormStrategy from './lib/passportStrategies/FormStrategy.js';
import knexConfig from '../knexfile.cjs';
import models from './models/index.js';
import ru from './locales/ru.js';
import en from './locales/en.js';
import getHelpers from './helpers/index.js';
import addRoutes from './routes/index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const mode = process.env.NODE_ENV || 'development';
const isDevelopment = mode !== 'production';

const registerPlugins = (app) => {
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  });
  app.register(fastifySecureSession, {
    secret: process.env.SESSION_SECRET,
    salt: process.env.SESSION_SALT,
    cookie: {
      path: '/',
    },
  });
  const passport = fastifyPassport.default;
  passport.registerUserDeserializer(
    (user) => app.objection.models.user.query().findById(user.id),
  );
  passport.registerUserSerializer((user) => Promise.resolve(user));
  passport.use(new FormStrategy('form', app));
  app.register(passport.initialize());
  app.register(passport.secureSession());
  app.decorate('fp', passport);
  app.register(fastifyFormbody, { parser: qs.parse });
  app.register(fastifyMethodOverride);

  app.register(fastifyStatic, {
    root: path.join(dirname, '..', 'assets'),
    prefix: '/assets',
  });
};

const setupViews = (app) => {
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

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, res: this });
  });
};

const setUpLocalization = (app) => {
  i18next.init({
    lng: 'ru',
    fallbackLng: 'en',
    debug: isDevelopment,
    resources: { ru, en },
  });

  app.decorate('t', (...args) => i18next.t(args));
};

const addHooks = (app) => {
  app.addHook('preHandler', async (req, res) => {
    res.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    };
  });
};

export default () => {
  const configPath = path.join(dirname, '..', 'config.env');
  dotenv.config({ path: configPath });

  const logger = mode === 'test' ? false : { prettyPrint: isDevelopment };
  const app = fastify({
    logger,
    ignoreTrailingSlash: true,
  });

  registerPlugins(app);
  setUpLocalization(app);
  setupViews(app);
  addRoutes(app);
  addHooks(app);

  return app;
};
