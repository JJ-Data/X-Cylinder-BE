
const { sequelize } = require('../dist/models');

async function sync() {
    console.log('🔄 FORCE SYNC: Starting (Safe Mode)...');
    try {
        await sequelize.authenticate();
        console.log('✅ Connection OK');

        // Explicitly force: false, alter: false to prevent "Too many keys" error
        // This will ONLY create missing tables and leave existing ones alone.
        await sequelize.sync({ force: false, alter: false });

        console.log('✅ FORCE SYNC: Complete');
        await sequelize.close();
        process.exit(0);
    } catch (e) {
        console.error('❌ FORCE SYNC: Failed', e);
        process.exit(1);
    }
}

sync();
