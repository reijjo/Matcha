// This file is used to store all the configuration variables

// here we are requiring the dotenv library which is a zero-dependency module that loads environment variables from a .env file into process.env. We are then calling the config method on the dotenv library which will load our environment variables from the .env file into process.env. The config method will look for a file named .env in the root directory of our project.
require('dotenv').config();

// we are assigning the PORT environment variable to a variable called PORT. We are then exporting the PORT variable so that we can use it in other files.
const PORT = process.env.PORT;

const EMAIL = process.env.EMAIL;

const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// we are exporting an object with all of our configuration variables. We are using the process.env object to access our environment variables. We are also exporting the PORT variable so that we can use it in other files.
module.exports = {
    pgUser: process.env.PGUSER,
    pgHost: process.env.PGHOST,
    pgDatabase: process.env.PGDATABASE,
    pgPassword: process.env.PGPASSWORD,
    pgPort: process.env.PGPORT,
    PORT,
    EMAIL,
    EMAIL_PASSWORD,
};
