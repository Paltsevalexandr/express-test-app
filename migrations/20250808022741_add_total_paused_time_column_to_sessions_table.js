/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('sessions', function(table) {
      table.integer('total_paused_time').notNullable().defaultTo(0); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sessions', function(table) {
    table.dropColumn('total_pauses_time');
  });
};
