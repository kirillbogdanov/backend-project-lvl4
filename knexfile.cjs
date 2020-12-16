const path = require('path');
const dotenv = require('dotenv');
const { parse } = require('pg-connection-string');

const configPath = path.join(__dirname, 'config.env');
dotenv.config({ path: configPath });

const migrations = {
  directory: path.resolve('server', 'migrations'),
};

const sqliteConfig = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './db.sqlite',
  },
  migrations,
};

module.exports = {
  local: {
    client: 'pg',
    useNullAsDefault: true,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations,
  },
  development: sqliteConfig,
  test: sqliteConfig,
  production: {
    client: 'pg',
    useNullAsDefault: true,
    connection: {
      ssl: true,
      ...parse(process.env.DATABASE_URL || ''),
    },
    migrations,
  },
};
