import { Client } from 'pg';
import { config } from '@config/environment';

const createDatabase = async (): Promise<void> => {
  // For PostgreSQL, we connect to the default 'postgres' database first
  const client = new Client({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: 'postgres', // Connect to default database
  });

  try {
    await client.connect();

    // PostgreSQL: Create database if it doesn't exist
    await client.query(`CREATE DATABASE "${config.database.name}"`);
    console.log(`Database '${config.database.name}' created.`);
  } catch (error: any) {
    // Database already exists (error code 42P04)
    if (error.code === '42P04') {
      console.log(`Database '${config.database.name}' already exists.`);
    } else {
      console.error('Error creating database:', error);
      throw error;
    }
  } finally {
    await client.end();
  }

  // Create test database if in test environment
  if (config.isTest) {
    const testClient = new Client({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: 'postgres',
    });

    try {
      await testClient.connect();
      await testClient.query(`CREATE DATABASE "${config.database.name}_test"`);
      console.log(`Test database '${config.database.name}_test' created.`);
    } catch (error: any) {
      if (error.code === '42P04') {
        console.log(`Test database '${config.database.name}_test' already exists.`);
      } else {
        console.error('Error creating test database:', error);
        throw error;
      }
    } finally {
      await testClient.end();
    }
  }
};

// Run if called directly
if (require.main === module) {
  createDatabase()
    .then(() => {
      console.log('Database creation complete.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database creation failed:', error);
      process.exit(1);
    });
}

export default createDatabase;