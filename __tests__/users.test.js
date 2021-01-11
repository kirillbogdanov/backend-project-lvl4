import {
  afterAll, afterEach, beforeAll, describe, test,
} from '@jest/globals';
import _ from 'lodash';
import createApp from '../server';
import {
  postEntity, getEntityEditPage, patchEntity, fakeUserData, createUser, fakeTaskData,
  deleteEntity, getEntitiesList, getEntityCreationPage, authenticateAsUser, createStatus,
} from './helpers';

const omitPassword = (userData) => _.omit(userData, ['password']);

const prefix = '/users';
let app;

beforeAll(() => {
  app = createApp();
});

afterAll(() => {
  app.close();
});

afterEach(async () => {
  await app.objection.models.user.query().truncate();
});

test('CRUD main flow', async () => {
  const userData = fakeUserData();

  const createRes = await postEntity(app, prefix, userData);
  expect(createRes.statusCode).toBe(302);
  const user = await app.objection.models.user.query()
    .findOne({ email: userData.email });
  expect(user).toMatchObject(omitPassword(userData));

  const session = await authenticateAsUser(app, userData);

  const readRes = await getEntityEditPage(app, prefix, user.id, session);
  expect(readRes.statusCode).toBe(200);

  userData.firstName = fakeUserData().firstName;
  const patchRes = await patchEntity(
    app, prefix, user.id, { firstName: userData.firstName }, session,
  );
  expect(patchRes.statusCode).toBe(302);
  const patchedUser = await app.objection.models.user.query()
    .findOne({ email: userData.email });
  expect(patchedUser).toMatchObject(omitPassword(userData));
  expect(patchedUser.id).toBe(user.id);

  const deleteRes = await deleteEntity(app, prefix, user.id, session);
  expect(deleteRes.statusCode).toBe(302);
  const deletedUser = await app.objection.models.user.query()
    .findOne({ email: userData.email });
  expect(deletedUser).toBeUndefined();
});

describe('POST /users', () => {
  test('does not create user, if email is in use', async () => {
    const userData = fakeUserData();
    await postEntity(app, prefix, userData);
    await postEntity(app, prefix, userData);
    const users = await app.objection.models.user.query().where({ email: userData.email });

    expect(users).toHaveLength(1);
  });

  test('does not create user without one of the required props', async () => {
    const userData = fakeUserData();
    const requiredFields = ['email', 'password', 'firstName', 'lastName'];

    await Promise.all(requiredFields.map(async (field) => {
      const dataWithoutProp = _.omit(userData, field);
      await postEntity(app, prefix, dataWithoutProp);
      const user = await app.objection.models.user.query()
        .findOne(omitPassword(userData));

      expect(user).toBeUndefined();
    }));
  });
});

test('only user is able to edit or delete himself', async () => {
  const userData = fakeUserData();
  const userData2 = fakeUserData();
  await postEntity(app, prefix, userData);
  await postEntity(app, prefix, userData2);
  const user = await app.objection.models.user.query()
    .findOne({ email: userData.email });
  const user2Session = await authenticateAsUser(app, userData2);
  const sessions = [undefined, user2Session];

  await Promise.all(sessions.map(async (session) => {
    const getRes = await getEntityEditPage(app, prefix, user.id, session);
    expect(getRes.statusCode).toBe(302);

    const patchRes = await patchEntity(
      app, prefix, user.id, { firstName: fakeUserData().firstName }, session,
    );
    expect(patchRes.statusCode).toBe(302);
    const patchedUser = await app.objection.models.user.query()
      .findOne({ email: userData.email });
    expect(patchedUser.firstName).toBe(userData.firstName);

    const deleteRes = await deleteEntity(app, prefix, user.id, session);
    expect(deleteRes.statusCode).toBe(302);
    const deletedUser = await app.objection.models.user.query()
      .findOne({ email: userData.email });
    expect(deletedUser).not.toBeUndefined();
  }));
});

describe('DELETE /users/:id', () => {
  test('user related to tasks cannot be deleted', async () => {
    const user1 = await createUser(app);
    const user2 = await createUser(app);
    user1.session = await authenticateAsUser(app, user1);
    user2.session = await authenticateAsUser(app, user2);
    const status = await createStatus(app, user1.session);

    let taskData = fakeTaskData(status.id, user2.id);
    await postEntity(app, '/tasks', taskData, user1.session);
    await deleteEntity(app, prefix, user2.id, user2.session);
    let deletedUser = await app.objection.models.user.query()
      .findById(user2.id);
    expect(deletedUser).not.toBeUndefined();

    taskData = fakeTaskData(status.id, user1.id);
    await postEntity(app, '/tasks', taskData, user2.session);
    await deleteEntity(app, prefix, user2.id, user2.session);
    deletedUser = await app.objection.models.user.query()
      .findById(user2.id);
    expect(deletedUser).not.toBeUndefined();
  });
});

test('GET /users', async () => {
  const res = await getEntitiesList(app, prefix);

  expect(res.statusCode).toBe(200);
});

test('GET /users/new', async () => {
  const res = await getEntityCreationPage(app, prefix);

  expect(res.statusCode).toBe(200);
});
