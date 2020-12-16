const path = require('path');
const dotenv = require('dotenv');

const configPath = path.join(__dirname, 'config.env');
dotenv.config({ path: configPath });

const migrations = {
  directory: path.resolve('server', 'migrations'),
};

const connection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

module.exports = {
  development: {
    client: 'pg',
    useNullAsDefault: true,
    connection,
    migrations,
  },
  test: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './db.sqlite',
    },
    migrations,
  },
  production: {
    client: 'pg',
    useNullAsDefault: true,
    connection,
    migrations,
  },
};
