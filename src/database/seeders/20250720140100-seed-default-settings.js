'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const findField = (cols, target) => {
      const t = target.toLowerCase().replace(/_/g, '');
      return cols.find(c => c.toLowerCase().replace(/_/g, '') === t) || target;
    };

    // Default pricing settings - simplified structure
    // Discover column names
    const [columns] = await queryInterface.sequelize.query('DESCRIBE business_settings;');
    const columnNames = columns.map(c => c.Field || c.column_name);
    console.log('Discovered columns for business_settings:', columnNames);

    const map = {
      category_id: findField(columnNames, 'category_id'),
      setting_key: findField(columnNames, 'setting_key'),
      setting_value: findField(columnNames, 'setting_value'),
      data_type: findField(columnNames, 'data_type'),
      outlet_id: findField(columnNames, 'outlet_id'),
      cylinder_type: findField(columnNames, 'cylinder_type'),
      operation_type: findField(columnNames, 'operation_type'),
      is_active: findField(columnNames, 'is_active'),
      created_by: findField(columnNames, 'created_by'),
      updated_by: findField(columnNames, 'updated_by'),
      created_at: findField(columnNames, 'created_at'),
      updated_at: findField(columnNames, 'updated_at')
    };


    const settings = [
      // Lease pricing - per KG system
      {
        category_id: 2,
        setting_key: 'lease.fee_per_kg',
        setting_value: JSON.stringify(1000),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'LEASE',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 2,
        setting_key: 'lease.deposit_per_kg',
        setting_value: JSON.stringify(500),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'LEASE',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },

      // Return penalty settings - based on cylinder condition
      {
        category_id: 2,
        setting_key: 'return.penalty.good',
        setting_value: JSON.stringify(0),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'LEASE',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 2,
        setting_key: 'return.penalty.poor',
        setting_value: JSON.stringify(500),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'LEASE',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 2,
        setting_key: 'return.penalty.damaged',
        setting_value: JSON.stringify(2000),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'LEASE',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },

      // Refill pricing
      {
        category_id: 3,
        setting_key: 'refill.price_per_kg',
        setting_value: JSON.stringify(10),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'REFILL',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 3,
        setting_key: 'refill.minimum_charge',
        setting_value: JSON.stringify(50),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'REFILL',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },

      // Swap pricing - based on cylinder condition
      {
        category_id: 4,
        setting_key: 'swap.fee.good',
        setting_value: JSON.stringify(0),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'SWAP',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 4,
        setting_key: 'swap.fee.poor',
        setting_value: JSON.stringify(200),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'SWAP',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 4,
        setting_key: 'swap.fee.damaged',
        setting_value: JSON.stringify(500),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: 'SWAP',
        is_active: true,
        created_by: 1,
        updated_by: 1
      },

      // General settings
      {
        category_id: 10,
        setting_key: 'tax.rate',
        setting_value: JSON.stringify(7.5),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: null,
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 10,
        setting_key: 'tax.type',
        setting_value: JSON.stringify('exclusive'),
        data_type: 'string',
        outlet_id: null,
        cylinder_type: null,
        operation_type: null,
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 10,
        setting_key: 'late.fee.daily',
        setting_value: JSON.stringify(10),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: null,
        is_active: true,
        created_by: 1,
        updated_by: 1
      },

      // Business rules
      {
        category_id: 8,
        setting_key: 'business.max_active_leases_per_customer',
        setting_value: JSON.stringify(5),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: null,
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
      {
        category_id: 8,
        setting_key: 'business.inventory_low_threshold',
        setting_value: JSON.stringify(10),
        data_type: 'number',
        outlet_id: null,
        cylinder_type: null,
        operation_type: null,
        is_active: true,
        created_by: 1,
        updated_by: 1
      },
    ].map(s => {
      const mapped = {};
      Object.keys(s).forEach(key => {
        mapped[map[key]] = s[key];
      });
      mapped[map.created_at] = now;
      mapped[map.updated_at] = now;
      return mapped;
    });

    await queryInterface.bulkInsert('business_settings', settings, {});

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('business_settings', null, {});
  }
};