'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cylinders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      cylinder_code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      type: { type: Sequelize.ENUM('5kg', '10kg', '15kg', '50kg'), allowNull: false },
      status: {
        type: Sequelize.ENUM('available', 'leased', 'refilling', 'damaged', 'retired'),
        defaultValue: 'available', allowNull: false,
      },
      current_outlet_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'outlets', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      qr_code: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      manufacture_date: { type: Sequelize.DATE, allowNull: true },
      last_inspection_date: { type: Sequelize.DATE, allowNull: true },
      current_gas_volume: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0, allowNull: false },
      max_gas_volume: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('cylinders', ['status'], { name: 'idx_cylinders_status' });
    await queryInterface.addIndex('cylinders', ['current_outlet_id'], { name: 'idx_cylinders_outlet' });
    await queryInterface.addIndex('cylinders', ['type'], { name: 'idx_cylinders_type' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cylinders');
  },
};
