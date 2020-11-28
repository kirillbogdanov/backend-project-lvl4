import welcome from './welcome.js';

const controllers = [
  welcome,
];

export default (app) => controllers.forEach((controller) => app.register(controller));
