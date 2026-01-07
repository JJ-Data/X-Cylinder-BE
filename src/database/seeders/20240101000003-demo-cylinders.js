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

    // 2. Discover column names
    const [columns] = await queryInterface.sequelize.query('DESCRIBE cylinders;');
    const columnNames = columns.map(c => c.Field || c.column_name);

    const map = {
      cylinder_code: columnNames.includes('cylinder_code') ? 'cylinder_code' : 'cylinderCode',
      type: 'type',
      status: 'status',
      current_outlet_id: columnNames.includes('current_outlet_id') ? 'current_outlet_id' : 'currentOutletId',
      qr_code: columnNames.includes('qr_code') ? 'qr_code' : 'qrCode',
      manufacture_date: columnNames.includes('manufacture_date') ? 'manufacture_date' : 'manufactureDate',
      last_inspection_date: columnNames.includes('last_inspection_date') ? 'last_inspection_date' : 'lastInspectionDate',
      current_gas_volume: columnNames.includes('current_gas_volume') ? 'current_gas_volume' : 'currentGasVolume',
      max_gas_volume: columnNames.includes('max_gas_volume') ? 'max_gas_volume' : 'maxGasVolume',
      notes: 'notes',
      created_at: columnNames.includes('created_at') ? 'created_at' : 'createdAt',
      updated_at: columnNames.includes('updated_at') ? 'updated_at' : 'updatedAt'
    };

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

          const cylinderData = {
            cylinder_code: cylinderCode,
            type: cylinderType.type,
            status: i <= cylinderType.count * 0.7 ? 'available' : (i <= cylinderType.count * 0.9 ? 'leased' : 'refilling'),
            current_outlet_id: outlet.id,
            qr_code: qrCode,
            manufacture_date: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            last_inspection_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            current_gas_volume: cylinderType.maxVolume * (0.2 + Math.random() * 0.6),
            max_gas_volume: cylinderType.maxVolume,
            notes: null
          };

          const mapped = {};
          Object.keys(cylinderData).forEach(key => {
            mapped[map[key]] = cylinderData[key];
          });
          mapped[map.created_at] = new Date();
          mapped[map.updated_at] = new Date();

          cylinders.push(mapped);
        }
      }
    }

    await queryInterface.bulkInsert('cylinders', cylinders, {});


  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cylinders', null, {});
  }
};