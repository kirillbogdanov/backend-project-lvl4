import {
  afterAll, afterEach, beforeAll, describe, test,
} from '@jest/globals';
import createApp from '../server';
import {
  createUser, authenticateAsUser, getEntityCreationPage, getEntitiesList,
  postEntity, getEntityEditPage, patchEntity, deleteEntity, fakeLabelData,
} from './helpers';

const prefix = '/labels';
let app;
let user;

beforeAll(async () => {
  app = createApp();
  user = await createUser(app);
  user.session = await authenticateAsUser(app, user);
});

afterAll(() => {
  app.close();
});

afterEach(async () => {
  await app.objection.models.label.query().truncate();
});

test('CRUD main flow', async () => {
  const labelData = fakeLabelData();

  const createRes = await postEntity(app, prefix, labelData, user.session);
  expect(createRes.statusCode).toBe(302);
  const label = await app.objection.models.label.query()
    .findOne(labelData);
  expect(label).toMatchObject(labelData);

  const readRes = await getEntityEditPage(app, prefix, label.id, user.session);
  expect(readRes.statusCode).toBe(200);

  labelData.name = fakeLabelData().name;
  const patchRes = await patchEntity(
    app, prefix, label.id, labelData, user.session,
  );
  expect(patchRes.statusCode).toBe(302);
  const patchedLabel = await app.objection.models.label.query()
    .findOne(labelData);
  expect(patchedLabel).toMatchObject(labelData);
  expect(patchedLabel.id).toBe(label.id);

  const deleteRes = await deleteEntity(app, prefix, label.id, user.session);
  expect(deleteRes.statusCode).toBe(302);
  const deletedLabel = await app.objection.models.label.query()
    .findOne(labelData);
  expect(deletedLabel).toBeUndefined();
});

describe('POST /labels', () => {
  test('does not create label, if name is in use', async () => {
    const labelData = fakeLabelData();
    await postEntity(app, prefix, labelData, user.session);

    await postEntity(app, prefix, labelData, user.session);

    const labels = await app.objection.models.label.query().where(labelData);
    expect(labels).toHaveLength(1);
  });

  test('does not create label with no name specified', async () => {
    await postEntity(app, prefix, {}, user.session);

    const label = await app.objection.models.label.query()
      .findOne({ name: null });
    expect(label).toBeUndefined();
  });

  test('is unavailable for unauthenticated user', async () => {
    const labelData = fakeLabelData();

    await postEntity(app, prefix, labelData);

    const label = await app.objection.models.label.query()
      .findOne(labelData);
    expect(label).toBeUndefined();
  });
});

describe('PATCH /labels/:id', () => {
  test('does not patch label, if name is in use', async () => {
    const labelData = fakeLabelData();
    const labelData2 = fakeLabelData();
    await postEntity(app, prefix, labelData, user.session);
    await postEntity(app, prefix, labelData2, user.session);
    const label = await app.objection.models.label.query()
      .findOne(labelData);

    await patchEntity(app, prefix, label.id, labelData2, user.session);

    const labels = await app.objection.models.label.query().where(labelData2);
    expect(labels).toHaveLength(1);
  });

  test('is unavailable for unauthenticated user', async () => {
    const labelData = fakeLabelData();
    await postEntity(app, prefix, labelData, user.session);
    const label = await app.objection.models.label.query()
      .findOne(labelData);
    const patchLabelData = fakeLabelData();

    await patchEntity(app, prefix, label.id, patchLabelData);

    const patchedLabel = await app.objection.models.label.query()
      .findById(label.id);
    expect(patchedLabel.name).toBe(labelData.name);
  });
});

describe('DELETE /labels/:id', () => {
  test('is unavailable for unauthenticated user', async () => {
    const labelData = fakeLabelData();
    await postEntity(app, prefix, labelData, user.session);
    const label = await app.objection.models.label.query()
      .findOne(labelData);

    await deleteEntity(app, prefix, label.id);

    const deletedLabel = await app.objection.models.label.query()
      .findById(label.id);
    expect(deletedLabel.name).not.toBeUndefined();
  });

  test('returns 404 if label with specified id does not exists', async () => {
    const res = await deleteEntity(app, prefix, 9999999, user.session);

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /labels', () => {
  test('returns 200 for authenticated user', async () => {
    const res = await getEntitiesList(app, prefix, user.session);

    expect(res.statusCode).toBe(200);
  });

  test('is unavailable for unauthenticated user', async () => {
    const res = await getEntitiesList(app, prefix);

    expect(res.statusCode).toBe(302);
  });
});

describe('GET /labels/new', () => {
  test('returns 200 for authenticated user', async () => {
    const res = await getEntityCreationPage(app, prefix, user.session);

    expect(res.statusCode).toBe(200);
  });

  test('is unavailable for unauthenticated user', async () => {
    const res = await getEntityCreationPage(app, prefix);

    expect(res.statusCode).toBe(302);
  });
});

describe('GET /labels/:id/edit', () => {
  test('is unavailable for unauthenticated user', async () => {
    const labelData = fakeLabelData();
    await postEntity(app, prefix, labelData, user.session);
    const label = await app.objection.models.label.query()
      .findOne(labelData);

    const res = await getEntityEditPage(app, prefix, label.id);

    expect(res.statusCode).toBe(302);
  });

  test('returns 404 if label with specified id does not exists', async () => {
    const res = await getEntityEditPage(app, prefix, 9999999, user.session);

    expect(res.statusCode).toBe(404);
  });
});
