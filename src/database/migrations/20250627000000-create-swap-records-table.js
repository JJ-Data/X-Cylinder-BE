'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('swap_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      lease_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'lease_records', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      old_cylinder_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'cylinders', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      new_cylinder_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'cylinders', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      staff_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      swap_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      condition: {
        type: Sequelize.ENUM('good', 'poor', 'damaged'),
        defaultValue: 'good', allowNull: false,
      },
      weight_recorded: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      damage_notes: { type: Sequelize.TEXT, allowNull: true },
      swap_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0 },
      reason_for_fee: { type: Sequelize.TEXT, allowNull: true },
      old_cylinder_gas_volume: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      new_cylinder_gas_volume: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      gas_volume_difference: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      refill_cost: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0 },
      receipt_printed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('swap_records', ['lease_id'], { name: 'idx_swap_lease' });
    await queryInterface.addIndex('swap_records', ['old_cylinder_id'], { name: 'idx_swap_old_cylinder' });
    await queryInterface.addIndex('swap_records', ['new_cylinder_id'], { name: 'idx_swap_new_cylinder' });
    await queryInterface.addIndex('swap_records', ['staff_id'], { name: 'idx_swap_staff' });
    await queryInterface.addIndex('swap_records', ['swap_date'], { name: 'idx_swap_date' });
    await queryInterface.addIndex('swap_records', ['condition'], { name: 'idx_swap_condition' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('swap_records');
  },
};
