import { Model } from 'objection';
import _ from 'lodash';
import User from './User.js';
import Status from './Status.js';
import Label from './Label.js';

export default class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'creatorId', 'statusId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'text' },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: ['integer', 'null'] },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      status: {
        relation: Model.BelongsToOneRelation,
        modelClass: Status,
        join: {
          from: 'tasks.statusId',
          to: 'statuses.id',
        },
      },
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },
      executor: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },
      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: Label,
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_labels.task_id',
            to: 'tasks_labels.label_id',
          },
          to: 'labels.id',
        },
      },
    };
  }

  async $beforeDelete() {
    await this.$relatedQuery('labels').unrelate();
  }

  async addLabels(labelIds) {
    await this.$relatedQuery('labels').relate(labelIds);
  }

  async deleteLabels(labelIds) {
    await this.$relatedQuery('labels').unrelate().whereIn('labels.id', labelIds);
  }

  $parseJson(json, opt) {
    const obj = super.$parseJson(json, opt);
    const propNames = Object.keys(this.constructor.jsonSchema.properties)
      .filter((propName) => propName !== 'id');

    return _.pick(obj, propNames);
  }
}
