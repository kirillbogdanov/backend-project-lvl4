exports.up = (knex) => (
  knex.schema.createTable('tasks', (table) => {
    table.increments('id');
    table.string('name').notNullable();
    table.text('description');
    table.integer('status_id').notNullable().references('statuses.id');
    table.integer('creator_id').notNullable().references('users.id');
    table.integer('executor_id').nullable().references('users.id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

exports.down = (knex) => knex.schema.dropTable('tasks');
