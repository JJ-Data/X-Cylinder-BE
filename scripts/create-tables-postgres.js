const { Client } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL || 'postgresql://xcylinder_user:4rbUMPCfKtt1u0smQdbmZlpgWqY7EgS7@dpg-d5j743ili9vc73aqg09g-a/xcylinder_db';

const SQL_COMMANDS = [
    // Create enums
    `CREATE TYPE IF NOT EXISTS enum_users_role AS ENUM ('admin', 'staff', 'customer');`,
    `CREATE TYPE IF NOT EXISTS enum_users_payment_status AS ENUM ('pending', 'paid', 'overdue');`,
    `CREATE TYPE IF NOT EXISTS enum_outlets_status AS ENUM ('active', 'inactive');`,
    `CREATE TYPE IF NOT EXISTS enum_cylinders_type AS ENUM ('5kg', '10kg', '15kg', '50kg');`,
    `CREATE TYPE IF NOT EXISTS enum_cylinders_status AS ENUM ('available', 'leased', 'refilling', 'damaged', 'retired');`,

    // Create outlets table (no dependencies)
    `CREATE TABLE IF NOT EXISTS outlets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    location TEXT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    status enum_outlets_status NOT NULL DEFAULT 'active',
    manager_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

    // Create users table
    `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role enum_users_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    outlet_id INTEGER REFERENCES outlets(id) ON DELETE SET NULL,
    payment_status enum_users_payment_status DEFAULT 'pending',
    activated_at TIMESTAMPTZ,
    phone_number VARCHAR(20),
    alternate_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

    // Add the manager_id foreign key to outlets
    `ALTER TABLE outlets DROP CONSTRAINT IF EXISTS outlets_manager_id_fkey;`,
    `ALTER TABLE outlets ADD CONSTRAINT outlets_manager_id_fkey 
   FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;`,

    // Create cylinders table
    `CREATE TABLE IF NOT EXISTS cylinders (
    id SERIAL PRIMARY KEY,
    cylinder_code VARCHAR(50) NOT NULL UNIQUE,
    type enum_cylinders_type NOT NULL,
    status enum_cylinders_status NOT NULL DEFAULT 'available',
    current_outlet_id INTEGER NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    qr_code VARCHAR(255) NOT NULL UNIQUE,
    manufacture_date TIMESTAMPTZ,
    last_inspection_date TIMESTAMPTZ,
    current_gas_volume DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_gas_volume DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

    // Create other essential tables
    `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
];

async function createTables() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        for (let i = 0; i < SQL_COMMANDS.length; i++) {
            const sql = SQL_COMMANDS[i];
            const preview = sql.substring(0, 60).replace(/\n/g, ' ');

            try {
                await client.query(sql);
                console.log(`✅ [${i + 1}/${SQL_COMMANDS.length}] ${preview}...`);
            } catch (err) {
                console.error(`❌ [${i + 1}/${SQL_COMMANDS.length}] Failed: ${err.message}`);
            }
        }

        console.log('\n🎉 Table creation complete!\n');

        // Create admin user
        console.log('Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        try {
            const result = await client.query(`
        INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified, created_at, updated_at)
        VALUES ($1, $2, 'Admin', 'User', 'admin', true, true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
        RETURNING id
      `, ['admin@cellerhut.com', hashedPassword]);

            console.log('✅ Admin user created/updated!');
            console.log('📧 Email: admin@cellerhut.com');
            console.log('🔑 Password: admin123\n');
        } catch (err) {
            console.error('❌ Failed to create admin user:', err.message);
        }

        // Verify tables
        const result = await client.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        console.log(`📋 Total tables: ${result.rows.length}`);
        result.rows.forEach(row => console.log(`   - ${row.tablename}`));

    } finally {
        await client.end();
    }
}

createTables()
    .then(() => {
        console.log('\n✅ Setup complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Fatal error:', err);
        process.exit(1);
    });
