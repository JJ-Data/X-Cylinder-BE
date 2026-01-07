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

    const findField = (cols, targets) => {
      if (!Array.isArray(targets)) targets = [targets];
      for (const target of targets) {
        const t = target.toLowerCase().replace(/_/g, '');
        const found = cols.find(c => c.toLowerCase().replace(/_/g, '') === t);
        if (found) return found;
      }
      return null;
    };

    // Discover column names for cylinders, lease_records, and users
    const [cylColumns] = await queryInterface.sequelize.query('DESCRIBE cylinders;');
    const cylColNames = cylColumns.map(c => c.Field || c.column_name);
    const cylOutletCol = findField(cylColNames, ['current_outlet_id', 'outlet_id']);

    const [leaseColumns] = await queryInterface.sequelize.query('DESCRIBE lease_records;');
    const leaseColNames = leaseColumns.map(c => c.Field || c.column_name);

    const [uColumns] = await queryInterface.sequelize.query('DESCRIBE users;');
    const userColNames = uColumns.map(c => c.Field || c.column_name);
    const userOutletCol = findField(userColNames, ['outlet_id', 'outletId']);

    console.log('Discovered columns:', { cylinders: cylColNames, lease_records: leaseColNames, users: userColNames });

    const leaseMap = {
      cylinder_id: findField(leaseColNames, ['cylinder_id', 'cylinderId']),
      customer_id: findField(leaseColNames, ['customer_id', 'customerId']),
      outlet_id: findField(leaseColNames, ['outlet_id', 'outletId']),
      staff_id: findField(leaseColNames, ['staff_id', 'staffId']),
      lease_date: findField(leaseColNames, ['lease_date', 'leaseDate']),
      expected_return_date: findField(leaseColNames, ['expected_return_date', 'expectedReturnDate']),
      actual_return_date: findField(leaseColNames, ['actual_return_date', 'actualReturnDate', 'return_date']),
      return_staff_id: findField(leaseColNames, ['return_staff_id', 'returnStaffId']),
      lease_status: findField(leaseColNames, ['lease_status', 'leaseStatus', 'status']),
      deposit_amount: findField(leaseColNames, ['deposit_amount', 'depositAmount']),
      lease_amount: findField(leaseColNames, ['lease_amount', 'leaseAmount']),
      refund_amount: findField(leaseColNames, ['refund_amount', 'refundAmount']),
      notes: findField(leaseColNames, 'notes'),
      created_at: findField(leaseColNames, 'created_at'),
      updated_at: findField(leaseColNames, 'updated_at')
    };


    // Get some cylinders that are marked as 'leased'
    const leasedCylinders = await queryInterface.sequelize.query(
      `SELECT id${cylOutletCol ? `, ${cylOutletCol} as current_outlet_id` : ''} FROM cylinders WHERE status = 'leased' LIMIT 20`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );


    // Get customer IDs
    const customers = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'customer' ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get staff IDs
    const staff = await queryInterface.sequelize.query(
      `SELECT id, ${userOutletCol} as outlet_id FROM users WHERE role = 'staff' ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );


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
        if (leaseMap[key]) {
          mapped[leaseMap[key]] = leaseData[key];
        }
      });
      if (leaseMap.created_at) mapped[leaseMap.created_at] = leaseDate;
      if (leaseMap.updated_at) mapped[leaseMap.updated_at] = new Date();
      leaseRecords.push(mapped);
    });

    // Create some returned lease records
    const availableCylinders = await queryInterface.sequelize.query(
      `SELECT id${cylOutletCol ? `, ${cylOutletCol} as current_outlet_id` : ''} FROM cylinders WHERE status = 'available' LIMIT 10`,
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
        if (leaseMap[key]) {
          mapped[leaseMap[key]] = leaseData[key];
        }
      });
      if (leaseMap.created_at) mapped[leaseMap.created_at] = leaseDate;
      if (leaseMap.updated_at) mapped[leaseMap.updated_at] = returnDate;
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