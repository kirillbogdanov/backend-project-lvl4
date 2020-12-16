import errors from './errors.js';
import welcome from './welcome.js';
import users from './users.js';
import session from './session.js';

const controllers = [
  welcome,
  users,
  session,
  errors,
];

export default (app) => controllers.forEach((controller) => app.register(controller));
