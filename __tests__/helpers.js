import faker from 'faker';
import qs from 'qs';
import _ from 'lodash';

export const fakeUserData = () => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
});

export const postUser = (app, propsObj) => app.inject({
  method: 'POST',
  url: '/users',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
  body: qs.stringify({ data: propsObj }),
});

export const patchUser = (app, id, propsObj, session) => app.inject({
  method: 'PATCH',
  url: `/users/${id}`,
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
  cookies: {
    session,
  },
  body: qs.stringify({ data: propsObj }),
});

export const getUser = (app, id, session) => app.inject({
  method: 'GET',
  cookies: {
    session,
  },
  url: `/users/${id}/edit`,
});

export const deleteUser = (app, id, session) => app.inject({
  method: 'DELETE',
  cookies: {
    session,
  },
  url: `/users/${id}`,
});

export const postSession = (app, propsObj) => app.inject({
  method: 'POST',
  url: '/session',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
  body: qs.stringify({ data: propsObj }),
});

export const omitPassword = (userData) => _.omit(userData, ['password']);
