#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "---------------------------------------------------"
echo "🚀 STARTING RAILWAY DEPLOYMENT ORCHESTRATOR"
echo "---------------------------------------------------"

# 1. Run Migrations
echo "📂 Step 1: Running database migrations..."
npx sequelize-cli db:migrate --config src/database/config.js

# 2. Run Seeders
echo "🌱 Step 2: Running database seeders..."
# Sequelize CLI tracks which seeders have already run in the database.
# We use '|| true' here because if the environment has issues tracking seed state,
# we don't want a duplicate entry error to crash the entire application startup.
npx sequelize-cli db:seed:all --config src/database/config.js || echo "⚠️ Seeding skipped or already applied."


echo "---------------------------------------------------"
echo "✅ DATABASE SETUP COMPLETE. STARTING APP..."
echo "---------------------------------------------------"

# 3. Start the application using the production command
pnpm start
