import {
  afterAll, beforeAll, describe, test,
} from '@jest/globals';
import createApp from '../server';

describe('requests', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('GET /session/new', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/session/new',
    });

    expect(res.statusCode).toBe(200);
  });

  afterAll(() => {
    app.close();
  });
});
