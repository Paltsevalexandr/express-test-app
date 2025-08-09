Description

# express-test-app

A simple Express.js project for testing and demonstration purposes.
It is simulates a production line time tracking system. 
This application will help workers track the duration of a
build process, enter production defects, and manage extended work time after the
scheduled duration has passed.
Application is using MySQL for saving data and knex library for simplifying 
database requests.

## Features
- JSON request/response handling

## Database structure
The database contains following tables:
- users
- builds (with login_id which is related to users table's login_id)
- sessions (with user_id foreign key, related to id of the row in users table,
   one-to-many relation)
- timestamps (with session_id foreign key, related to id of the row in sessions table, 
   one-to-many relation). Contains data about the pause, resume and popup interaction time. The "type" column reflects the type of row: 1-pause, 2-resume, 3-extended time
   from popup.
- defects - amount of defects related to session (with session_id foreign key, related
   to id of the row in sessions table, one-to-one relation)

Note: 
the project contains migrations files and seed files which
are using to create tables in database and fill "users" and "builds" tables
with mocked data.

### Installation

1. Clone the repository:
   git clone https://github.com/Paltsevalexandr/express-test-app.git
   cd express-test-app

2. Install dependencies:
   npm install

3. Modify knexfile.js
   To let the to connect to the database you need to modify
   knexfile.js. Change port, user and password fields to
   match your credentials.

Create database:
1. mysql -u root -p
"root" should be replaced with DB user name.
When prompted enter password for mysql user.
2. CREATE DATABASE myapp_test;
3. EXIT;
4. to create all the tables -  knex migrate:latest
5. to seed the database -   knex seed:run


### Running the App

Start the development server:
```bash
node server
```
The server will run on [http://localhost:5000].
