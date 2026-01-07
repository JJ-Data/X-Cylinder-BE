
import 'tsconfig-paths/register';
import { sequelize } from '../models'; // Import from models to ensure they are initialized
import { logger } from '../utils/logger';

const syncDatabase = async () => {
    try {
        console.log('🔄 STARTING DATABASE SYNC...');
        console.log('   (This will create missing tables like outlets, cylinders, etc.)');

        // Check connection first
        await sequelize.authenticate();
        console.log('✅ Connection established.');

        // Sync all defined models to the database
        // Removed { alter: true } to prevent "Too many keys" error on repeated runs.
        // Default sync() will create missing tables (outlets, cylinders) but won't crash on existing ones.
        await sequelize.sync();

        console.log('✅ DATABASE SYNC COMPLETE.');
        console.log('   All tables should now exist.');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ DATABASE SYNC FAILED:', error);
        process.exit(1);
    }
};

syncDatabase();
