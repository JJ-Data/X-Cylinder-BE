'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const findField = (cols, target) => {
      const t = target.toLowerCase().replace(/_/g, '');
      return cols.find(c => c.toLowerCase().replace(/_/g, '') === t) || target;
    };

    // Discover column names
    const [columns] = await queryInterface.sequelize.query('DESCRIBE setting_categories;');
    const columnNames = columns.map(c => c.Field || c.column_name);
    console.log('Discovered columns for setting_categories:', columnNames);

    const map = {
      id: findField(columnNames, 'id'),
      name: findField(columnNames, 'name'),
      description: findField(columnNames, 'description'),
      icon: findField(columnNames, 'icon'),
      is_active: findField(columnNames, 'is_active'),
      display_order: findField(columnNames, 'display_order'),
      created_at: findField(columnNames, 'created_at'),
      updated_at: findField(columnNames, 'updated_at')
    };


    const categories = [
      {
        id: 1,
        name: 'PRICING',
        description: 'General pricing settings for all operations',
        icon: 'price-tag',
        is_active: true,
        display_order: 1
      },
      {
        id: 2,
        name: 'LEASE',
        description: 'Cylinder lease specific settings and pricing',
        icon: 'calendar',
        is_active: true,
        display_order: 2
      },
      {
        id: 3,
        name: 'REFILL',
        description: 'Gas refill operations and pricing settings',
        icon: 'gas-pump',
        is_active: true,
        display_order: 3
      },
      {
        id: 4,
        name: 'SWAP',
        description: 'Cylinder swap operations and fee settings',
        icon: 'refresh',
        is_active: true,
        display_order: 4
      },
      {
        id: 5,
        name: 'REGISTRATION',
        description: 'Customer registration and onboarding settings',
        icon: 'user-plus',
        is_active: true,
        display_order: 5
      },
      {
        id: 6,
        name: 'PENALTIES',
        description: 'Penalty rates and fine settings',
        icon: 'alert-triangle',
        is_active: true,
        display_order: 6
      },
      {
        id: 7,
        name: 'DEPOSITS',
        description: 'Security deposit amounts and policies',
        icon: 'shield',
        is_active: true,
        display_order: 7
      },
      {
        id: 8,
        name: 'BUSINESS_RULES',
        description: 'General business operation rules and limits',
        icon: 'settings',
        is_active: true,
        display_order: 8
      },
      {
        id: 9,
        name: 'DISCOUNTS',
        description: 'Customer tier discounts and promotional settings',
        icon: 'percent',
        is_active: true,
        display_order: 9
      },
      {
        id: 10,
        name: 'TAXES',
        description: 'Tax rates and calculation settings',
        icon: 'calculator',
        is_active: true,
        display_order: 10
      },
    ].map(c => {
      const mapped = {};
      Object.keys(c).forEach(key => {
        mapped[map[key]] = c[key];
      });
      mapped[map.created_at] = now;
      mapped[map.updated_at] = now;
      return mapped;
    });

    await queryInterface.bulkInsert('setting_categories', categories, {});

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('setting_categories', null, {});
  }
};