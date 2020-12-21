import {
  afterAll, beforeAll, describe, test,
} from '@jest/globals';
import _ from 'lodash';
import faker from 'faker';
import setCookie from 'set-cookie-parser';
import createApp from '../server';
import {
  postEntity, getEntity, patchEntity,
  deleteEntity, getEntitiesList, getEntityCreationPage,
} from './helpers';

const fakeUserData = () => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
});

const omitPassword = (userData) => _.omit(userData, ['password']);

describe('requests', () => {
  const prefix = '/users';
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('CRUD main flow', async () => {
    const userData = fakeUserData();

    const createRes = await postEntity(app, prefix, userData);
    expect(createRes.statusCode).toBe(302);
    const user = await app.objection.models.user.query()
      .findOne({ email: userData.email });
    expect(user).toMatchObject(omitPassword(userData));

    const signinRes = await postEntity(app, '/session', _.pick(userData, ['email', 'password']));
    const session = setCookie.parseString(signinRes.headers['set-cookie']).value;
    expect(signinRes.statusCode).toBe(302);

    const readRes = await getEntity(app, prefix, user.id, session);
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
    const signinRes = await postEntity(app, '/session', _.pick(userData2, ['email', 'password']));
    const user2Session = setCookie.parseString(signinRes.headers['set-cookie']).value;
    const sessions = [undefined, user2Session];

    await Promise.all(sessions.map(async (session) => {
      const getRes = await getEntity(app, prefix, user.id, session);
      expect(getRes.statusCode).toBe(302);

      const patchRes = await patchEntity(
        app, prefix, user.id, { firstName: faker.name.firstName() }, session,
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

  test('GET /users', async () => {
    const res = await getEntitiesList(app, prefix);

    expect(res.statusCode).toBe(200);
  });

  test('GET /users/new', async () => {
    const res = await getEntityCreationPage(app, prefix);

    expect(res.statusCode).toBe(200);
  });

  afterAll(() => {
    app.close();
  });
});
