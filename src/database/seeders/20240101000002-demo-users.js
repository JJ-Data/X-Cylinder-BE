'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if data already exists
    const [existingUsers] = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 1;'
    );

    if (existingUsers.length > 0) {
      console.log('Users table already has data. Skipping demo seeding...');
      return;
    }

    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // 2. Discover column names for users and outlets
    const [userColumns] = await queryInterface.sequelize.query('DESCRIBE users;');
    const userColNames = userColumns.map(c => c.Field || c.column_name);

    const userMap = {
      email: 'email',
      password: 'password',
      first_name: userColNames.includes('first_name') ? 'first_name' : 'firstName',
      last_name: userColNames.includes('last_name') ? 'last_name' : 'lastName',
      role: 'role',
      is_active: userColNames.includes('is_active') ? 'is_active' : 'isActive',
      email_verified: userColNames.includes('email_verified') ? 'email_verified' : 'emailVerified',
      email_verified_at: userColNames.includes('email_verified_at') ? 'email_verified_at' : 'emailVerifiedAt',
      outlet_id: userColNames.includes('outlet_id') ? 'outlet_id' : (userColNames.includes('outletId') ? 'outletId' : null),
      payment_status: userColNames.includes('payment_status') ? 'payment_status' : 'paymentStatus',
      activated_at: userColNames.includes('activated_at') ? 'activated_at' : 'activatedAt',
      created_at: userColNames.includes('created_at') ? 'created_at' : 'createdAt',
      updated_at: userColNames.includes('updated_at') ? 'updated_at' : 'updatedAt'
    };

    const users = [
      {
        email: 'admin@cylinderx.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: 1,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'manager.main@cylinderx.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Manager',
        role: 'staff',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: 1,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'manager.north@cylinderx.com',
        password: hashedPassword,
        first_name: 'Sarah',
        last_name: 'Manager',
        role: 'staff',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: 2,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'staff1@cylinderx.com',
        password: hashedPassword,
        first_name: 'Mike',
        last_name: 'Staff',
        role: 'staff',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: 1,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'staff2@cylinderx.com',
        password: hashedPassword,
        first_name: 'Lisa',
        last_name: 'Staff',
        role: 'staff',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: 2,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'operator1@cylinderx.com',
        password: hashedPassword,
        first_name: 'Tom',
        last_name: 'Operator',
        role: 'refill_operator',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: 1,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'operator2@cylinderx.com',
        password: hashedPassword,
        first_name: 'Emma',
        last_name: 'Operator',
        role: 'refill_operator',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: 2,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'customer1@example.com',
        password: hashedPassword,
        first_name: 'Robert',
        last_name: 'Customer',
        role: 'customer',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: null,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'customer2@example.com',
        password: hashedPassword,
        first_name: 'Alice',
        last_name: 'Customer',
        role: 'customer',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        outlet_id: null,
        payment_status: 'active',
        activated_at: new Date()
      },
      {
        email: 'customer3@example.com',
        password: hashedPassword,
        first_name: 'David',
        last_name: 'Customer',
        role: 'customer',
        is_active: true,
        email_verified: false,
        email_verified_at: null,
        outlet_id: null,
        payment_status: 'pending',
        activated_at: null
      }
    ].map(u => {
      const mapped = {};
      Object.keys(u).forEach(key => {
        if (userMap[key]) {
          mapped[userMap[key]] = u[key];
        }
      });
      mapped[userMap.created_at] = new Date();
      mapped[userMap.updated_at] = new Date();
      return mapped;
    });

    await queryInterface.bulkInsert('users', users, {});

    // Discover column names for outlets
    const [outletColumns] = await queryInterface.sequelize.query('DESCRIBE outlets;');
    const outletColNames = outletColumns.map(c => c.Field || c.column_name);
    const managerCol = outletColNames.includes('manager_id') ? 'manager_id' : 'managerId';

    // Update outlets with manager IDs
    await queryInterface.sequelize.query(
      `UPDATE outlets SET ${managerCol} = 2 WHERE id = 1`
    );
    await queryInterface.sequelize.query(
      `UPDATE outlets SET ${managerCol} = 3 WHERE id = 2`
    );

  },

  async down(queryInterface, Sequelize) {
    // First remove manager references from outlets
    await queryInterface.sequelize.query(
      `UPDATE outlets SET manager_id = NULL`
    );

    await queryInterface.bulkDelete('users', null, {});
  }
};