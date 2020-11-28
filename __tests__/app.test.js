import createApp from '../server/index.js';

describe('requests', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('start test', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(res.statusCode).toBe(200);
  });

  afterAll(() => {
    app.close();
  });
});
