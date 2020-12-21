import {
  afterAll, beforeAll, describe, test,
} from '@jest/globals';
import createApp from '../server';
import { getEntityCreationPage } from './helpers';

describe('requests', () => {
  const prefix = '/session';
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('GET /session/new', async () => {
    const res = await getEntityCreationPage(app, prefix);

    expect(res.statusCode).toBe(200);
  });

  afterAll(() => {
    app.close();
  });
});
