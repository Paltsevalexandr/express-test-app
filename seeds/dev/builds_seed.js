/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('builds').del()
  await knex('builds').insert([
    {
		id: 1,
		login_id: 'user1',
		build_number: 1,
		number_of_parts: 5,
      	time_per_part: 1
    },
    {
		id: 2,
		login_id: 'user2',
		build_number: 2,
		number_of_parts: 1,
      	time_per_part: 1
    },
    {
		id: 3,
		login_id: 'user3',
		build_number: 3,
		number_of_parts: 7,
		time_per_part: 3
    }
  ]);
};
