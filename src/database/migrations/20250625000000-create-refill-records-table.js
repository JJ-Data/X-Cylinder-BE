'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refill_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      cylinder_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'cylinders', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      operator_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      outlet_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'outlets', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      refill_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      pre_refill_volume: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      post_refill_volume: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      refill_cost: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      batch_number: { type: Sequelize.STRING(100), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('refill_records', ['cylinder_id'], { name: 'idx_refill_cylinder' });
    await queryInterface.addIndex('refill_records', ['operator_id'], { name: 'idx_refill_operator' });
    await queryInterface.addIndex('refill_records', ['outlet_id'], { name: 'idx_refill_outlet' });
    await queryInterface.addIndex('refill_records', ['refill_date'], { name: 'idx_refill_date' });
    await queryInterface.addIndex('refill_records', ['batch_number'], { name: 'idx_refill_batch' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refill_records');
  },
};
