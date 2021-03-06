exports.up = (knex) => (
  knex.schema.createTable('statuses', (table) => {
    table.increments('id');
    table.string('name').unique().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

exports.down = (knex) => knex.schema.dropTable('statuses');
