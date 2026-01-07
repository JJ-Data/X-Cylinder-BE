'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if data already exists
    const [existingLeases] = await queryInterface.sequelize.query(
      'SELECT id FROM lease_records LIMIT 1;'
    );

    if (existingLeases.length > 0) {
      console.log('Lease records already exist. Skipping demo seeding...');
      return;
    }

    // Discover column names for cylinders and lease_records
    const [cylColumns] = await queryInterface.sequelize.query('DESCRIBE cylinders;');
    const cylColNames = cylColumns.map(c => c.Field || c.column_name);
    const cylOutletCol = cylColNames.includes('current_outlet_id') ? 'current_outlet_id' : 'currentOutletId';

    const [leaseColumns] = await queryInterface.sequelize.query('DESCRIBE lease_records;');
    const leaseColNames = leaseColumns.map(c => c.Field || c.column_name);

    const leaseMap = {
      cylinder_id: leaseColNames.includes('cylinder_id') ? 'cylinder_id' : 'cylinderId',
      customer_id: leaseColNames.includes('customer_id') ? 'customer_id' : 'customerId',
      outlet_id: leaseColNames.includes('outlet_id') ? 'outlet_id' : 'outletId',
      staff_id: leaseColNames.includes('staff_id') ? 'staff_id' : 'staffId',
      lease_date: leaseColNames.includes('lease_date') ? 'lease_date' : 'leaseDate',
      expected_return_date: leaseColNames.includes('expected_return_date') ? 'expected_return_date' : 'expectedReturnDate',
      actual_return_date: leaseColNames.includes('actual_return_date') ? 'actual_return_date' : 'actualReturnDate',
      return_staff_id: leaseColNames.includes('return_staff_id') ? 'return_staff_id' : 'returnStaffId',
      lease_status: leaseColNames.includes('lease_status') ? 'lease_status' : 'leaseStatus',
      deposit_amount: leaseColNames.includes('deposit_amount') ? 'deposit_amount' : 'depositAmount',
      lease_amount: leaseColNames.includes('lease_amount') ? 'lease_amount' : 'leaseAmount',
      refund_amount: leaseColNames.includes('refund_amount') ? 'refund_amount' : 'refundAmount',
      notes: 'notes',
      created_at: leaseColNames.includes('created_at') ? 'created_at' : 'createdAt',
      updated_at: leaseColNames.includes('updated_at') ? 'updated_at' : 'updatedAt'
    };

    // Get some cylinders that are marked as 'leased'
    const leasedCylinders = await queryInterface.sequelize.query(
      `SELECT id, ${cylOutletCol} as current_outlet_id FROM cylinders WHERE status = 'leased' LIMIT 20`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get customer IDs
    const customers = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'customer' ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get staff IDs
    const staff = await queryInterface.sequelize.query(
      `SELECT id, ${cylColNames.includes('outlet_id') ? 'outlet_id' : (cylColNames.includes('outletId') ? 'outletId' : 'id')} as outlet_id FROM users WHERE role = 'staff' ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    // Note: for users table, I need to check if it has outlet_id or outletId. 
    // Actually, I'll just check if the users table has outlet columns.
    const [userColumns] = await queryInterface.sequelize.query('DESCRIBE users;');
    const userColNames = userColumns.map(c => c.Field || c.column_name);
    const userOutletCol = userColNames.includes('outlet_id') ? 'outlet_id' : (userColNames.includes('outletId') ? 'outletId' : null);

    const leaseRecords = [];
    const now = new Date();

    // Create lease records for leased cylinders
    leasedCylinders.forEach((cylinder, index) => {
      const customer = customers[index % customers.length];
      const staffMember = staff.find(s => s.outlet_id === cylinder.current_outlet_id) || staff[0];
      const leaseDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      const leaseData = {
        cylinder_id: cylinder.id,
        customer_id: customer.id,
        outlet_id: cylinder.current_outlet_id,
        staff_id: staffMember.id,
        lease_date: leaseDate,
        expected_return_date: new Date(leaseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        actual_return_date: null,
        return_staff_id: null,
        lease_status: 'active',
        deposit_amount: 500.00,
        lease_amount: 50.00,
        refund_amount: null,
        notes: null
      };

      const mapped = {};
      Object.keys(leaseData).forEach(key => {
        mapped[leaseMap[key]] = leaseData[key];
      });
      mapped[leaseMap.created_at] = leaseDate;
      mapped[leaseMap.updated_at] = new Date();
      leaseRecords.push(mapped);
    });

    // Create some returned lease records
    const availableCylinders = await queryInterface.sequelize.query(
      `SELECT id, ${cylOutletCol} as current_outlet_id FROM cylinders WHERE status = 'available' LIMIT 10`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    availableCylinders.forEach((cylinder, index) => {
      const customer = customers[index % customers.length];
      const staffMember = staff.find(s => s.outlet_id === cylinder.current_outlet_id) || staff[0];
      const leaseDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000 - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const returnDate = new Date(leaseDate.getTime() + (20 + Math.random() * 20) * 24 * 60 * 60 * 1000);

      const leaseData = {
        cylinder_id: cylinder.id,
        customer_id: customer.id,
        outlet_id: cylinder.current_outlet_id,
        staff_id: staffMember.id,
        lease_date: leaseDate,
        expected_return_date: new Date(leaseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        actual_return_date: returnDate,
        return_staff_id: staffMember.id,
        lease_status: 'returned',
        deposit_amount: 500.00,
        lease_amount: 50.00,
        refund_amount: 450.00,
        notes: 'Cylinder returned in good condition'
      };

      const mapped = {};
      Object.keys(leaseData).forEach(key => {
        mapped[leaseMap[key]] = leaseData[key];
      });
      mapped[leaseMap.created_at] = leaseDate;
      mapped[leaseMap.updated_at] = returnDate;
      leaseRecords.push(mapped);
    });

    if (leaseRecords.length > 0) {
      await queryInterface.bulkInsert('lease_records', leaseRecords, {});
    }

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lease_records', null, {});
  }
};