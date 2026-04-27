require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_data',
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'sequelize_meta',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + '_test',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_data',
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'sequelize_meta',
  },
  production: {
    // Render injects DATABASE_URL automatically when a database is linked.
    // Fall back to individual DB_* vars if DATABASE_URL is not set.
    use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : undefined,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_data',
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'sequelize_meta',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
