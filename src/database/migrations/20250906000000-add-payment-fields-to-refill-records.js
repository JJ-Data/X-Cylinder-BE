'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('refill_records', 'payment_method', {
      type: Sequelize.ENUM('cash', 'pos', 'bank_transfer'),
      allowNull: true,
      defaultValue: 'cash',
    });

    await queryInterface.addColumn('refill_records', 'payment_reference', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('refill_records', 'payment_reference');
    await queryInterface.removeColumn('refill_records', 'payment_method');
  }
};