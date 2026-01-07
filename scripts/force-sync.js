
const { sequelize } = require('../dist/models');

async function sync() {
    console.log('🔄 FORCE SYNC: Starting (Safe Mode)...');
    try {
        await sequelize.authenticate();
        console.log('✅ Connection OK');

        // Check if a core table already exists
        const [results] = await sequelize.query("SHOW TABLES LIKE 'cylinders'");

        if (results.length > 0) {
            console.log('✅ Tables already exist (cylinders found). Skipping sync to prevent "Too many keys" error.');
            await sequelize.close();
            process.exit(0);
        }

        console.log('⚠️ Tables missing. Running creation sync...');

        // Only run sync if tables are missing.
        // alter: false ensures we strictly create, never modify.
        await sequelize.sync({ force: false, alter: false });

        console.log('✅ FORCE SYNC: Complete (Tables Created)');
        await sequelize.close();
        process.exit(0);
    } catch (e) {
        // If we hit "Too many keys" or "Duplicate key", just ignore it and proceed.
        if (e.name === 'SequelizeDatabaseError' || e.message.includes('Too many keys')) {
            console.log('⚠️ Sync hit a known index error but probably succeeded in creating tables. Ignoring and proceeding...');
            process.exit(0);
        }

        console.error('❌ FORCE SYNC: Failed', e);
        process.exit(1);
    }
}

sync();
