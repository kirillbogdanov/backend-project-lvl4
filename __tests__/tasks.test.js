import {
  afterAll, afterEach, beforeAll, describe, test,
} from '@jest/globals';
import _ from 'lodash';
import createApp from '../server';
import {
  createUser, authenticateAsUser, getEntityCreationPage, getEntitiesList, getEntityPage,
  postEntity, getEntityEditPage, patchEntity, deleteEntity, createStatus, fakeTaskData,
} from './helpers';

const prefix = '/tasks';
let app;
let user1;
let user2;
let status1;
let status2;

beforeAll(async () => {
  app = createApp();
  user1 = await createUser(app);
  user2 = await createUser(app);
  user1.session = await authenticateAsUser(app, user1);
  user2.session = await authenticateAsUser(app, user2);
  status1 = await createStatus(app, user1.session);
  status2 = await createStatus(app, user2.session);
});

afterAll(() => {
  app.close();
});

afterEach(async () => {
  await app.objection.models.task.query().truncate();
});

test('CRUD main flow', async () => {
  const taskData = fakeTaskData(status1.id, user2.id);

  const createRes = await postEntity(app, prefix, taskData, user1.session);
  expect(createRes.statusCode).toBe(302);
  const task = await app.objection.models.task.query()
    .findOne(taskData);
  expect(task).toMatchObject(taskData);

  const readRes = await getEntityEditPage(app, prefix, task.id, user1.session);
  expect(readRes.statusCode).toBe(200);

  taskData.name = fakeTaskData(status1.id, user2.id).name;
  const patchRes = await patchEntity(
    app, prefix, task.id, taskData, user1.session,
  );
  expect(patchRes.statusCode).toBe(302);
  const patchedTask = await app.objection.models.task.query()
    .findOne(taskData);
  expect(patchedTask).toMatchObject(taskData);
  expect(patchedTask.id).toBe(task.id);

  const deleteRes = await deleteEntity(app, prefix, task.id, user1.session);
  expect(deleteRes.statusCode).toBe(302);
  const deletedTask = await app.objection.models.task.query()
    .findOne(taskData);
  expect(deletedTask).toBeUndefined();
});

describe('POST /tasks', () => {
  test('does not create task with one of the required fields not specified', async () => {
    const taskData = fakeTaskData(status1.id, user2.id);
    const requiredFields = ['name', 'statusId'];

    await Promise.all(requiredFields.map(async (field) => {
      const dataWithoutProp = _.omit(taskData, field);
      await postEntity(app, prefix, dataWithoutProp, user1.session);
      const task = await app.objection.models.task.query()
        .findOne(taskData);

      expect(task).toBeUndefined();
    }));
  });

  test('is unavailable for unauthenticated user', async () => {
    const taskData = fakeTaskData(status1.id, user2.id);

    await postEntity(app, prefix, taskData);

    const task = await app.objection.models.task.query()
      .findOne(taskData);
    expect(task).toBeUndefined();
  });

  test('sets creatorId automatically', async () => {
    const taskData = fakeTaskData(status1.id, user2.id);

    await postEntity(app, prefix, taskData, user1.session);
    const task = await app.objection.models.task.query()
      .findOne(taskData);

    expect(task.creatorId).toBe(user1.id);
  });
});

describe('GET /tasks/:id/edit', () => {
  test('is unavailable for unauthenticated user', async () => {
    const taskData = fakeTaskData(status1.id, user2.id);
    await postEntity(app, prefix, taskData, user1.session);
    const task = await app.objection.models.task.query()
      .findOne(taskData);

    const res = await getEntityEditPage(app, prefix, task.id);

    expect(res.statusCode).toBe(302);
  });

  test('returns 404 if task with specified id does not exists', async () => {
    const res = await getEntityEditPage(app, prefix, 9999999, user1.session);

    expect(res.statusCode).toBe(404);
  });
});

describe('PATCH /tasks/:id', () => {
  test('is unavailable for unauthenticated user', async () => {
    const taskData = fakeTaskData(status1.id, user2.id);
    await postEntity(app, prefix, taskData, user1.session);
    const task = await app.objection.models.task.query()
      .findOne(taskData);
    const patchTaskData = fakeTaskData(status2.id, user1.id);

    await patchEntity(app, prefix, task.id, patchTaskData);

    const patchedTask = await app.objection.models.task.query()
      .findById(task.id);
    expect(patchedTask).toMatchObject(taskData);
  });

  test('returns 404 if task with specified id does not exists', async () => {
    const taskData = fakeTaskData(status1.id, user2.id);

    const res = await patchEntity(app, prefix, 9999999, taskData, user1.session);

    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  test('is available only for creator', async () => {
    const taskData = fakeTaskData(status1.id, user2.id);
    await postEntity(app, prefix, taskData, user1.session);
    const task = await app.objection.models.task.query()
      .findOne(taskData);

    await deleteEntity(app, prefix, task.id);
    await deleteEntity(app, prefix, task.id, user2.session);

    const deletedTask = await app.objection.models.task.query()
      .findById(task.id);
    expect(deletedTask).not.toBeUndefined();
  });

  test('returns 404 if task with specified id does not exists', async () => {
    const res = await deleteEntity(app, prefix, 9999999, user1.session);

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /tasks', () => {
  test('returns 200 for authenticated user', async () => {
    const res = await getEntitiesList(app, prefix, user1.session);

    expect(res.statusCode).toBe(200);
  });

  test('is unavailable for unauthenticated user', async () => {
    const res = await getEntitiesList(app, prefix);

    expect(res.statusCode).toBe(302);
  });
});

describe('GET /tasks/new', () => {
  test('returns 200 for authenticated user', async () => {
    const res = await getEntityCreationPage(app, prefix, user1.session);

    expect(res.statusCode).toBe(200);
  });

  test('is unavailable for unauthenticated user', async () => {
    const res = await getEntityCreationPage(app, prefix);

    expect(res.statusCode).toBe(302);
  });
});

describe('GET /tasks/:id', () => {
  let id;

  beforeAll(async () => {
    const taskData = fakeTaskData(status1.id, user2.id);

    await postEntity(app, prefix, taskData, user1.session);
    const task = await app.objection.models.task.query()
      .findOne(taskData);

    id = task.id;
  });

  test('returns 200 for authenticated user', async () => {
    const res = await getEntityPage(app, prefix, id, user1.session);

    expect(res.statusCode).toBe(200);
  });

  test('is unavailable for unauthenticated user', async () => {
    const res = await getEntityPage(app, prefix, id);

    expect(res.statusCode).toBe(302);
  });

  test('returns 404 if task with specified id does not exists', async () => {
    const res = await getEntityPage(app, prefix, 999999, user1.session);

    expect(res.statusCode).toBe(404);
  });
});
