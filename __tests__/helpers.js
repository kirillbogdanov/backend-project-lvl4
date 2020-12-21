import faker from 'faker';
import qs from 'qs';
import _ from 'lodash';
import setCookie from 'set-cookie-parser';

export const fakeUserData = () => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
});

export const postEntity = (app, prefix, propsObj, session) => app.inject({
  method: 'POST',
  url: prefix,
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
  cookies: {
    session,
  },
  body: qs.stringify({ data: propsObj }),
});

export const patchEntity = (app, prefix, id, propsObj, session) => app.inject({
  method: 'PATCH',
  url: `${prefix}/${id}`,
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
  cookies: {
    session,
  },
  body: qs.stringify({ data: propsObj }),
});

export const getEntity = (app, prefix, id, session) => app.inject({
  method: 'GET',
  cookies: {
    session,
  },
  url: `${prefix}/${id}/edit`,
});

export const deleteEntity = (app, prefix, id, session) => app.inject({
  method: 'DELETE',
  cookies: {
    session,
  },
  url: `${prefix}/${id}`,
});

export const getEntitiesList = (app, prefix, session) => app.inject({
  method: 'GET',
  cookies: {
    session,
  },
  url: `${prefix}`,
});

export const getEntityCreationPage = (app, prefix, session) => app.inject({
  method: 'GET',
  cookies: {
    session,
  },
  url: `${prefix}/new`,
});

export const authenticateAsNewUser = async (app) => {
  const userData = fakeUserData();
  await postEntity(app, '/users', userData);
  const signinRes = await postEntity(app, '/session', _.pick(userData, ['email', 'password']));

  return setCookie.parseString(signinRes.headers['set-cookie']).value;
};

export const omitPassword = (userData) => _.omit(userData, ['password']);
