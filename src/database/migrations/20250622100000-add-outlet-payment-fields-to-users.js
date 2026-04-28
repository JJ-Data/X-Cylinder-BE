'use strict';

// These columns exist in the User model but were missing from the original
// create-users-table migration (they were previously created by force-sync).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'outlet_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'outlets', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('users', 'payment_status', {
      type: Sequelize.ENUM('pending', 'active', 'inactive'),
      defaultValue: 'pending',
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'activated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('users', ['outlet_id'], { name: 'idx_users_outlet_id' });
    await queryInterface.addIndex('users', ['payment_status'], { name: 'idx_users_payment_status' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'idx_users_outlet_id');
    await queryInterface.removeIndex('users', 'idx_users_payment_status');
    await queryInterface.removeColumn('users', 'activated_at');
    await queryInterface.removeColumn('users', 'payment_status');
    await queryInterface.removeColumn('users', 'outlet_id');
  },
};
