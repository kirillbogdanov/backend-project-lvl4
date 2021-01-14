exports.up = (knex) => (
  knex.schema.createTable('tasks_labels', (table) => {
    table.increments('id');
    table.integer('task_id').notNullable().references('tasks.id');
    table.integer('label_id').notNullable().references('labels.id');
  })
);

exports.down = (knex) => knex.schema.dropTable('tasks_labels');
