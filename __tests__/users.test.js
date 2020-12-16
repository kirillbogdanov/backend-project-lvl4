import {
  afterAll, beforeAll, describe, test,
} from '@jest/globals';
import _ from 'lodash';
import faker from 'faker';
import setCookie from 'set-cookie-parser';
import createApp from '../server';
import {
  fakeUserData, postUser, getUser, patchUser, deleteUser, postSession, omitPassword,
} from './helpers';

describe('requests', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('CRUD', async () => {
    const userData = fakeUserData();

    const createRes = await postUser(app, userData);
    expect(createRes.statusCode).toBe(302);
    const user = await app.objection.models.user.query()
      .findOne({ email: userData.email });
    expect(user).toMatchObject(omitPassword(userData));

    const signinRes = await postSession(app, _.pick(userData, ['email', 'password']));
    const session = setCookie.parseString(signinRes.headers['set-cookie']).value;
    expect(signinRes.statusCode).toBe(302);

    const readRes = await getUser(app, user.id, session);
    expect(readRes.statusCode).toBe(200);

    userData.firstName = faker.name.firstName();
    const patchRes = await patchUser(app, user.id, { firstName: userData.firstName }, session);
    expect(patchRes.statusCode).toBe(302);
    const patchedUser = await app.objection.models.user.query()
      .findOne({ email: userData.email });
    expect(patchedUser).toMatchObject(omitPassword(userData));
    expect(patchedUser.id).toBe(user.id);

    const deleteRes = await deleteUser(app, user.id, session);
    expect(deleteRes.statusCode).toBe(302);
    const deletedUser = await app.objection.models.user.query()
      .findOne({ email: userData.email });
    expect(deletedUser).toBeUndefined();
  });

  describe('POST /users', () => {
    test('does not create user, if email is in use', async () => {
      const userData = fakeUserData();
      await postUser(app, userData);
      await postUser(app, userData);
      const users = await app.objection.models.user.query().where({ email: userData.email });
      expect(users).toHaveLength(1);
    });

    test('does not create user without one of the required props', async () => {
      const userData = fakeUserData();
      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      await Promise.all(requiredFields.map(async (field) => {
        const dataWithoutProp = _.omit(userData, field);
        await postUser(app, dataWithoutProp);
        const user = await app.objection.models.user.query()
          .findOne(omitPassword(userData));

        expect(user).toBeUndefined();
      }));
    });

    // test('validates user email', async () => {
    //   const userData = fakeUserData();
    //   userData.email = faker.name.firstName();
    //   await postUser(app, userData);
    //   const user1 = await app.objection.models.user.query()
    //     .findOne(omitPassword(userData));
    //   expect(user1).toBeUndefined();
    //
    //   userData.email = `${faker.name.firstName()}@domain`;
    //   await postUser(app, userData);
    //   const user2 = await app.objection.models.user.query()
    //     .findOne(omitPassword(userData));
    //   expect(user2).toBeUndefined();
    // });
  });

  test('only user is able to edit or delete himself', async () => {
    const userData = fakeUserData();
    const userData2 = fakeUserData();
    await postUser(app, userData);
    await postUser(app, userData2);
    const user = await app.objection.models.user.query()
      .findOne({ email: userData.email });
    const signinRes = await postSession(app, _.pick(userData2, ['email', 'password']));
    const user2Session = setCookie.parseString(signinRes.headers['set-cookie']).value;
    const sessions = [undefined, user2Session];

    await Promise.all(sessions.map(async (session) => {
      const getRes = await getUser(app, user.id, session);
      expect(getRes.statusCode).toBe(302);

      const patchRes = await patchUser(
        app, user.id, { firstName: faker.name.firstName() }, session,
      );
      expect(patchRes.statusCode).toBe(302);
      const patchedUser = await app.objection.models.user.query()
        .findOne({ email: userData.email });
      expect(patchedUser.firstName).toBe(userData.firstName);

      const deleteRes = await deleteUser(app, user.id, session);
      expect(deleteRes.statusCode).toBe(302);
      const deletedUser = await app.objection.models.user.query()
        .findOne({ email: userData.email });
      expect(deletedUser).toBeTruthy();
    }));
  });

  test('GET /users', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/users',
    });

    expect(res.statusCode).toBe(200);
  });

  test('GET /users/new', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/users/new',
    });

    expect(res.statusCode).toBe(200);
  });

  afterAll(() => {
    app.close();
  });
});
