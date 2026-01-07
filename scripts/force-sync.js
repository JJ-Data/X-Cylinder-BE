const { sequelize } = require('../dist/models');

async function sync() {
    console.log('🔄 FORCE SYNC: Starting (Granular Mode)...');
    try {
        await sequelize.authenticate();
        console.log('✅ Connection OK');

        // Iterate over all models and sync them individually
        // This ensures that if one fails (e.g. cylinders index duplicate), 
        // the others (e.g. setting_categories) still get created.
        for (const modelName of Object.keys(sequelize.models)) {
            const model = sequelize.models[modelName];
            try {
                // console.log(`   - Syncing model: ${modelName}...`);
                await model.sync({ force: false, alter: false });
            } catch (modelError) {
                // Ignore specific known errors errors but log them
                if (modelError.message.includes('Too many keys') || modelError.name === 'SequelizeDatabaseError') {
                    console.log(`   ⚠️ Skipped ${modelName} due to index limit/DB error (Table likely exists).`);
                } else {
                    console.error(`   ❌ Failed to sync ${modelName}:`, modelError.message);
                }
            }
        }

        console.log('✅ FORCE SYNC: Complete (All models processed)');
        await sequelize.close();
        process.exit(0);
    } catch (e) {
        console.error('❌ FORCE SYNC: Fatal Error', e);
        process.exit(1);
    }
}

sync();
