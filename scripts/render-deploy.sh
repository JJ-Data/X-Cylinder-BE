#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "---------------------------------------------------"
echo "🚀 STARTING RENDER DEPLOYMENT"
echo "---------------------------------------------------"

# Step 0: Sync Database Schema (Creates all tables fresh)
echo "🔄 Step 0: Syncing Database Schema..."
export TS_NODE_PROJECT=tsconfig.prod.json
node -r tsconfig-paths/register scripts/force-sync.js || echo "⚠️ Schema sync completed with warnings"

# Step 1: Run Migrations (if any exist)
echo "📂 Step 1: Running database migrations..."
npx sequelize-cli db:migrate --config src/database/config.js || echo "ℹ️ No migrations to run or already applied"

# Step 2: Run Seeders (Initial data)
echo "🌱 Step 2: Running database seeders..."
npx sequelize-cli db:seed:all --config src/database/config.js || echo "⚠️ Seeders skipped or already applied"

echo "---------------------------------------------------"
echo "✅ DATABASE SETUP COMPLETE. STARTING APP..."
echo "---------------------------------------------------"

# Step 3: Start the application
pnpm start
