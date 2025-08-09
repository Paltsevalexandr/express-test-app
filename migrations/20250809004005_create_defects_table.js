/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('defects', (table) => {
        table.increments("id").primary();
        table.integer("session_id").notNullable().unsigned().unique().references('id').inTable('sessions').onDelete('CASCADE');
        table.integer("defects_amount").notNullable().defaultTo(0);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("defects");
};
