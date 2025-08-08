/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('sessions', function(table) {
      table.boolean('is_paused').notNullable().defaultTo(false); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sessions', function(table) {
    table.dropColumn('is_paused');
  });
};
