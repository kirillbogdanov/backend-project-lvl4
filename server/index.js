// import Rollbar from 'rollbar';
import fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pug from 'pug';
import pointOfView from 'point-of-view';

import addRoutes from './routes/index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const registerPlugins = (app) => {
  app.register(pointOfView, {
    engine: {
      pug,
    },
    root: path.join(dirname, 'views'),
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

  app.ready((err) => {
    if (err) throw err;
    app.log.info('All plugins loaded');
  });

  // app.use('/assets', express.static(path.join(dirname, '..', 'assets')));
  // app.set('views', path.join(dirname, 'views'));
  // app.set('view engine', 'pug');
  // app.use(logger);
  //
  // app.get('/', (req, res) => {
  //   res.render('index');
  // });
  //
  // if (isProduction) {
  //   const rollbar = new Rollbar({
  //     accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  //     captureUncaught: true,
  //     captureUnhandledRejections: true,
  //   });
  //
  //   app.use(rollbar.errorHandler());
  // }

  return app;
};
