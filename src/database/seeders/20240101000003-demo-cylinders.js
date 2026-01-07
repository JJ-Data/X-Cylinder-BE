'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Check if data already exists
    const [existingCylinders] = await queryInterface.sequelize.query(
      'SELECT id FROM cylinders LIMIT 1;'
    );

    if (existingCylinders.length > 0) {
      console.log('Cylinders table already has data. Skipping demo seeding...');
      return;
    }

    // 2. Discover column names (handle cylinder_code vs cylinderCode mismatch)
    const [columns] = await queryInterface.sequelize.query('DESCRIBE cylinders;');
    const columnNames = columns.map(c => c.Field || c.column_name);

    const codeColumn = columnNames.includes('cylinder_code') ? 'cylinder_code' :
      (columnNames.includes('cylinderCode') ? 'cylinderCode' : null);

    if (!codeColumn) {
      console.error('Could not find cylinder_code or cylinderCode column. Available columns:', columnNames);
      throw new Error('Table schema mismatch: missing cylinder code column');
    }

    const cylinders = [];

    // Generate cylinders for each outlet
    const outlets = [
      { id: 1, prefix: 'MAIN' },
      { id: 2, prefix: 'NORTH' },
      { id: 3, prefix: 'SOUTH' }
    ];

    const types = [
      { type: '5kg', maxVolume: 5.0, count: 10 },
      { type: '10kg', maxVolume: 10.0, count: 8 },
      { type: '15kg', maxVolume: 15.0, count: 5 },
      { type: '50kg', maxVolume: 50.0, count: 2 }
    ];

    for (const outlet of outlets) {
      for (const cylinderType of types) {
        for (let i = 1; i <= cylinderType.count; i++) {
          const cylinderCode = `${outlet.prefix}-${cylinderType.type.toUpperCase()}-${String(i).padStart(3, '0')}`;
          const qrCode = `QR-${cylinderCode}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

          const cylinder = {
            type: cylinderType.type,
            status: i <= cylinderType.count * 0.7 ? 'available' : (i <= cylinderType.count * 0.9 ? 'leased' : 'refilling'),
            current_outlet_id: outlet.id,
            qr_code: qrCode,
            manufacture_date: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            last_inspection_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            current_gas_volume: cylinderType.maxVolume * (0.2 + Math.random() * 0.6), // Random between 20% and 80%
            max_gas_volume: cylinderType.maxVolume,
            notes: null,
            created_at: new Date(),
            updated_at: new Date()
          };

          // Use the discovered column name
          cylinder[codeColumn] = cylinderCode;

          cylinders.push(cylinder);
        }
      }
    }

    await queryInterface.bulkInsert('cylinders', cylinders, {});

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cylinders', null, {});
  }
};