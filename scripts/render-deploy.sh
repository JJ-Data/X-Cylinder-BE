#!/bin/bash

set -e

echo "---------------------------------------------------"
echo "🚀 STARTING RENDER DEPLOYMENT"
echo "---------------------------------------------------"
echo "🔌 DATABASE_URL host: $(echo $DATABASE_URL | sed 's|.*@||' | sed 's|/.*||')"

# Step 1: Run Migrations
echo "📂 Step 1: Running database migrations..."
npx sequelize-cli db:migrate --config src/database/config.js
echo "✅ Migrations complete"

# Step 2: Run Seeders
echo "🌱 Step 2: Running database seeders..."
npx sequelize-cli db:seed:all --config src/database/config.js || echo "⚠️ Seeders skipped or already applied"

echo "---------------------------------------------------"
echo "✅ DATABASE SETUP COMPLETE. STARTING APP..."
echo "---------------------------------------------------"

# Step 3: Start the application
pnpm start
