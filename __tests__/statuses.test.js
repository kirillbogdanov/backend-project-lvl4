import {
  afterAll, beforeAll, describe, test, afterEach,
} from '@jest/globals';
import createApp from '../server';
import {
  createUser, authenticateAsUser, getEntityCreationPage, getEntitiesList,
  postEntity, getEntityEditPage, patchEntity, deleteEntity, fakeStatusData,
} from './helpers';

const prefix = '/statuses';
let app;
let session;

beforeAll(async () => {
  app = createApp();
  const user = await createUser(app);
  session = await authenticateAsUser(app, user);
});

afterAll(async () => {
  app.close();
});

afterEach(async () => {
  await app.objection.models.status.query().truncate();
});

test('CRUD main flow', async () => {
  const statusData = fakeStatusData();

  const createRes = await postEntity(app, prefix, statusData, session);
  expect(createRes.statusCode).toBe(302);
  const status = await app.objection.models.status.query()
    .findOne(statusData);
  expect(status).toMatchObject(statusData);

  const readRes = await getEntityEditPage(app, prefix, status.id, session);
  expect(readRes.statusCode).toBe(200);

  statusData.name = fakeStatusData().name;
  const patchRes = await patchEntity(
    app, prefix, status.id, statusData, session,
  );
  expect(patchRes.statusCode).toBe(302);
  const patchedStatus = await app.objection.models.status.query()
    .findOne(statusData);
  expect(patchedStatus).toMatchObject(statusData);
  expect(patchedStatus.id).toBe(status.id);

  const deleteRes = await deleteEntity(app, prefix, status.id, session);
  expect(deleteRes.statusCode).toBe(302);
  const deletedStatus = await app.objection.models.status.query()
    .findOne(statusData);
  expect(deletedStatus).toBeUndefined();
});

describe('POST /statuses', () => {
  test('does not create status, if name is in use', async () => {
    const statusData = fakeStatusData();
    await postEntity(app, prefix, statusData, session);

    await postEntity(app, prefix, statusData, session);

    const statuses = await app.objection.models.status.query().where(statusData);
    expect(statuses).toHaveLength(1);
  });

  test('does not create status with no name specified', async () => {
    await postEntity(app, prefix, {}, session);

    const status = await app.objection.models.status.query()
      .findOne({ name: null });
    expect(status).toBeUndefined();
  });

  test('is unavailable for unauthenticated user', async () => {
    const statusData = fakeStatusData();

    await postEntity(app, prefix, statusData);

    const status = await app.objection.models.status.query()
      .findOne(statusData);
    expect(status).toBeUndefined();
  });
});

describe('GET /statuses/:id/edit', () => {
  test('is unavailable for unauthenticated user', async () => {
    const statusData = fakeStatusData();
    await postEntity(app, prefix, statusData, session);
    const status = await app.objection.models.status.query()
      .findOne(statusData);

    const res = await getEntityEditPage(app, prefix, status.id);

    expect(res.statusCode).toBe(302);
  });

  test('returns 404 if status with specified id does not exists', async () => {
    const res = await getEntityEditPage(app, prefix, 9999999, session);

    expect(res.statusCode).toBe(404);
  });
});

describe('PATCH /statuses/:id', () => {
  test('does not patch status, if name is in use', async () => {
    const statusData = fakeStatusData();
    const statusData2 = fakeStatusData();
    await postEntity(app, prefix, statusData, session);
    await postEntity(app, prefix, statusData2, session);
    const status = await app.objection.models.status.query()
      .findOne(statusData);

    await patchEntity(app, prefix, status.id, statusData2, session);

    const statuses = await app.objection.models.status.query().where(statusData2);
    expect(statuses).toHaveLength(1);
  });

  test('is unavailable for unauthenticated user', async () => {
    const statusData = fakeStatusData();
    await postEntity(app, prefix, statusData, session);
    const status = await app.objection.models.status.query()
      .findOne(statusData);
    const patchStatusData = fakeStatusData();

    await patchEntity(app, prefix, status.id, patchStatusData);

    const patchedStatus = await app.objection.models.status.query()
      .findById(status.id);
    expect(patchedStatus.name).toBe(statusData.name);
  });

  test('returns 404 if status with specified id does not exists', async () => {
    const statusData = fakeStatusData();

    const res = await patchEntity(app, prefix, 9999999, statusData, session);

    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /statuses/:id', () => {
  test('is unavailable for unauthenticated user', async () => {
    const statusData = fakeStatusData();
    await postEntity(app, prefix, statusData, session);
    const status = await app.objection.models.status.query()
      .findOne(statusData);

    await deleteEntity(app, prefix, status.id);

    const deletedStatus = await app.objection.models.status.query()
      .findById(status.id);
    expect(deletedStatus.name).not.toBeUndefined();
  });

  test('returns 404 if status with specified id does not exists', async () => {
    const res = await deleteEntity(app, prefix, 9999999, session);

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /statuses', () => {
  test('returns 200 for authenticated user', async () => {
    const res = await getEntitiesList(app, prefix, session);

    expect(res.statusCode).toBe(200);
  });

  test('is unavailable for unauthenticated user', async () => {
    const res = await getEntitiesList(app, prefix);

    expect(res.statusCode).toBe(302);
  });
});

describe('GET /statuses/new', () => {
  test('returns 200 for authenticated user', async () => {
    const res = await getEntityCreationPage(app, prefix, session);

    expect(res.statusCode).toBe(200);
  });

  test('is unavailable for unauthenticated user', async () => {
    const res = await getEntityCreationPage(app, prefix);

    expect(res.statusCode).toBe(302);
  });
});
