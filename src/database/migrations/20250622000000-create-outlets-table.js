'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('outlets', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      location: { type: Sequelize.TEXT, allowNull: false },
      contact_phone: { type: Sequelize.STRING(20), allowNull: false },
      contact_email: { type: Sequelize.STRING(255), allowNull: false },
      status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active', allowNull: false },
      manager_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('outlets', ['status'], { name: 'idx_outlets_status' });
    await queryInterface.addIndex('outlets', ['manager_id'], { name: 'idx_outlets_manager_id' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('outlets');
  },
};
