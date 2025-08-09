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

### Installation

1. Clone the repository:
   git clone https://github.com/Paltsevalexandr/express-test-app.git
   cd express-test-app

2. Install dependencies:
   npm install
3. Create database:
a. mysql -u root -p
"root" should be replaced with DB user name.
When prompted enter password for mysql user.
b. CREATE DATABASE myapp_test;
c. EXIT;
d. to create all the tables -  knex migrate:latest
e. to seed the database -   knex seed:run
### Running the App

Start the development server:
```bash
node server
```
The server will run on [http://localhost:5000] by default.
