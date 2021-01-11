import {
  afterAll, beforeAll, test,
} from '@jest/globals';
import createApp from '../server';

let app;

beforeAll(() => {
  app = createApp();
});

afterAll(() => {
  app.close();
});

test('GET /', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/',
  });

  expect(res.statusCode).toBe(200);
});

test('GET /wrong-path', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/wrong-path',
  });

  expect(res.statusCode).toBe(404);
});
