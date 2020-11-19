import request from 'supertest';
import createApp from '../server/index.js';

describe('requests', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('start test', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
  });

  afterAll(() => {
    app.stop();
  });
});
