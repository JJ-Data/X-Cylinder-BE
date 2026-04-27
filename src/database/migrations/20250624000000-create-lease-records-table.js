'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lease_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      cylinder_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'cylinders', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      customer_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      outlet_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'outlets', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      staff_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      lease_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      expected_return_date: { type: Sequelize.DATE, allowNull: true },
      actual_return_date: { type: Sequelize.DATE, allowNull: true },
      return_staff_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      lease_status: {
        type: Sequelize.ENUM('active', 'returned', 'overdue'),
        defaultValue: 'active', allowNull: false,
      },
      deposit_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      lease_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_method: {
        type: Sequelize.ENUM('cash', 'pos', 'bank_transfer'),
        defaultValue: 'cash', allowNull: false,
      },
      refund_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('lease_records', ['cylinder_id'], { name: 'idx_lease_cylinder' });
    await queryInterface.addIndex('lease_records', ['customer_id'], { name: 'idx_lease_customer' });
    await queryInterface.addIndex('lease_records', ['outlet_id'], { name: 'idx_lease_outlet' });
    await queryInterface.addIndex('lease_records', ['staff_id'], { name: 'idx_lease_staff' });
    await queryInterface.addIndex('lease_records', ['lease_status'], { name: 'idx_lease_status' });
    await queryInterface.addIndex('lease_records', ['lease_date'], { name: 'idx_lease_date' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lease_records');
  },
};
