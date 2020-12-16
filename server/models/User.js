import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import _ from 'lodash';

import encrypt from '../lib/secure.js';

const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(Model) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 3 },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    };
  }

  $parseJson(json, opt) {
    const obj = super.$parseJson(json, opt);
    const propNames = Object.keys(this.constructor.jsonSchema.properties)
      .filter((propName) => propName !== 'id');

    return _.pick(obj, propNames);
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  isCorrectPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }
}
