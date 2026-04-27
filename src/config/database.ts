import { Sequelize } from 'sequelize';
import { config } from './environment';

const sslOptions =
  config.isProduction
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

const baseConfig = {
  dialect: 'postgres' as const,
  logging: config.isDevelopment ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  dialectOptions: sslOptions,
};

// Render automatically sets DATABASE_URL when a database is linked.
// Prefer it over individual DB_* vars so linking is the only step needed.
export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, baseConfig)
  : new Sequelize(config.database.name, config.database.user, config.database.password, {
      ...baseConfig,
      host: config.database.host,
      port: config.database.port,
    });

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    if (config.isDevelopment) {
      // Comment out automatic sync to avoid VIRTUAL column issues
      // Use migrations instead for schema changes
      // console.log('Note: Automatic database sync is disabled. Use migrations for schema changes.');

      // Uncomment below only when you need to sync the database

      // PostgreSQL doesn't require FOREIGN_KEY_CHECKS like MySQL
      // Optional: Clear login sessions to avoid truncation errors with JWT tokens
      // Uncomment the line below if you encounter session_id truncation errors
      // await sequelize.query('TRUNCATE TABLE login_sessions CASCADE');

      // Sync database schema
      // await sequelize.sync({ alter: true });

      console.log('Database synchronized successfully.');
    }
  } catch (error) {
    // Ensure foreign key checks are re-enabled even if sync fails
    // Comment out since sync is disabled
    /*
    if (config.isDevelopment) {
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Foreign key checks re-enabled after error.');
      } catch (fkError) {
        console.error('Failed to re-enable foreign key checks:', fkError);
      }
    }
    */
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully.');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};
