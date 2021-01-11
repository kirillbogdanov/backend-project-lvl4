import {
  afterAll, beforeAll, test,
} from '@jest/globals';
import createApp from '../server';
import { getEntityCreationPage } from './helpers';

const prefix = '/session';
let app;

beforeAll(() => {
  app = createApp();
});

afterAll(() => {
  app.close();
});

test('GET /session/new', async () => {
  const res = await getEntityCreationPage(app, prefix);

  expect(res.statusCode).toBe(200);
});
