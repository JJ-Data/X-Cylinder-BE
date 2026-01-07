'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if data already exists
    const [existingOutlets] = await queryInterface.sequelize.query(
      'SELECT id FROM outlets LIMIT 1;'
    );

    if (existingOutlets.length > 0) {
      console.log('Outlets table already has data. Skipping demo seeding...');
      return;
    }

    // 2. Discover column names
    const [columns] = await queryInterface.sequelize.query('DESCRIBE outlets;');
    const columnNames = columns.map(c => c.Field || c.column_name);
    console.log('Discovered columns for outlets:', columnNames);

    const findField = (cols, target) => {
      const t = target.toLowerCase().replace(/_/g, '');
      return cols.find(c => c.toLowerCase().replace(/_/g, '') === t) || target;
    };

    const map = {
      name: findField(columnNames, 'name'),
      location: findField(columnNames, 'location'),
      contact_phone: findField(columnNames, 'contact_phone'),
      contact_email: findField(columnNames, 'contact_email'),
      status: findField(columnNames, 'status'),
      manager_id: findField(columnNames, 'manager_id'),
      created_at: findField(columnNames, 'created_at'),
      updated_at: findField(columnNames, 'updated_at')
    };


    const outlets = [
      {
        name: 'Main Outlet',
        location: '123 Main Street, City Center',
        contact_phone: '+1234567890',
        contact_email: 'main@cylinderx.com',
        status: 'active',
        manager_id: null
      },
      {
        name: 'North Branch',
        location: '456 North Avenue, North District',
        contact_phone: '+1234567891',
        contact_email: 'north@cylinderx.com',
        status: 'active',
        manager_id: null
      },
      {
        name: 'South Branch',
        location: '789 South Boulevard, South District',
        contact_phone: '+1234567892',
        contact_email: 'south@cylinderx.com',
        status: 'active',
        manager_id: null
      },
      {
        name: 'East Branch',
        location: '321 East Road, East District',
        contact_phone: '+1234567893',
        contact_email: 'east@cylinderx.com',
        status: 'inactive',
        manager_id: null
      }
    ].map(o => {
      const mapped = {};
      Object.keys(o).forEach(key => {
        mapped[map[key]] = o[key];
      });
      mapped[map.created_at] = new Date();
      mapped[map.updated_at] = new Date();
      return mapped;
    });

    await queryInterface.bulkInsert('outlets', outlets, {});


  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('outlets', null, {});
  }
};