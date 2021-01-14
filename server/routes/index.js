import errors from './errors.js';
import welcome from './welcome.js';
import users from './users.js';
import session from './session.js';
import statuses from './statuses.js';
import tasks from './tasks.js';
import labels from './labels.js';

const controllers = [
  welcome,
  users,
  session,
  statuses,
  errors,
  tasks,
  labels,
];

export default (app) => controllers.forEach((controller) => app.register(controller));
