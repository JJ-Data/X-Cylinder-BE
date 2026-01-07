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
    console.log('Discovered columns for cylinders:', columnNames);

    const findField = (cols, target) => {
      const t = target.toLowerCase().replace(/_/g, '');
      return cols.find(c => c.toLowerCase().replace(/_/g, '') === t) || target;
    };

    const map = {
      cylinder_code: findField(columnNames, 'cylinder_code'),
      type: findField(columnNames, 'type'),
      status: findField(columnNames, 'status'),
      current_outlet_id: findField(columnNames, 'current_outlet_id'),
      qr_code: findField(columnNames, 'qr_code'),
      manufacture_date: findField(columnNames, 'manufacture_date'),
      last_inspection_date: findField(columnNames, 'last_inspection_date'),
      current_gas_volume: findField(columnNames, 'current_gas_volume'),
      max_gas_volume: findField(columnNames, 'max_gas_volume'),
      notes: findField(columnNames, 'notes'),
      created_at: findField(columnNames, 'created_at'),
      updated_at: findField(columnNames, 'updated_at')
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