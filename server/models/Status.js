import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import _ from 'lodash';

const unique = objectionUnique({ fields: ['name'] });

export default class Status extends unique(Model) {
  static get tableName() {
    return 'statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    };
  }

  $parseJson(json, opt) {
    const obj = super.$parseJson(json, opt);
    const propNames = Object.keys(this.constructor.jsonSchema.properties)
      .filter((propName) => propName !== 'id');

    return _.pick(obj, propNames);
  }
}
