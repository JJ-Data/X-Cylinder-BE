'use strict';

// Base transfer_records table — the migration 20250702100000 will rename
// transferred_by_id → initiated_by_id and add status/approval columns.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transfer_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      cylinder_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'cylinders', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      from_outlet_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'outlets', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      to_outlet_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'outlets', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      transferred_by_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      transfer_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      reason: { type: Sequelize.STRING(255), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('transfer_records', ['cylinder_id'], { name: 'idx_transfer_cylinder' });
    await queryInterface.addIndex('transfer_records', ['from_outlet_id'], { name: 'idx_transfer_from_outlet' });
    await queryInterface.addIndex('transfer_records', ['to_outlet_id'], { name: 'idx_transfer_to_outlet' });
    await queryInterface.addIndex('transfer_records', ['transferred_by_id'], { name: 'idx_transfer_by' });
    await queryInterface.addIndex('transfer_records', ['transfer_date'], { name: 'idx_transfer_date' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('transfer_records');
  },
};
