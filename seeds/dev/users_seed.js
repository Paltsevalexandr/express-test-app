/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('users').del()
  await knex('users').insert([
    {
		id: 1,
		login_id: 'user1',
    },
    {
        id: 2,
        login_id: 'user2',
    },
    {
		id: 3,
		login_id: 'user3',
    }
  ]);
};
