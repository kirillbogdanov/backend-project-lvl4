import {
  afterAll, beforeAll, describe, test,
} from '@jest/globals';
import createApp from '../server';

describe('requests', () => {
  let app;

  beforeAll(() => {
    app = createApp();
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

  afterAll(() => {
    app.close();
  });
});
