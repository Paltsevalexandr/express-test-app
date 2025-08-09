/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('sessions', function(table) {
      table.string('submission_type').notNullable().defaultTo(""); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sessions', function(table) {
    table.dropColumn('submission_type');
  });
};
