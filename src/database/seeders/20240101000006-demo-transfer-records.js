'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if data already exists
    const [existingTransfers] = await queryInterface.sequelize.query(
      'SELECT id FROM transfer_records LIMIT 1;'
    );

    if (existingTransfers.length > 0) {
      console.log('Transfer records already exist. Skipping demo seeding...');
      return;
    }

    const findField = (cols, target) => {
      const t = target.toLowerCase().replace(/_/g, '');
      return cols.find(c => c.toLowerCase().replace(/_/g, '') === t) || target;
    };

    // Discover column names for cylinders, users, and transfer_records
    const [cylColumns] = await queryInterface.sequelize.query('DESCRIBE cylinders;');
    const cylColNames = cylColumns.map(c => c.Field || c.column_name);
    const cylOutletCol = findField(cylColNames, 'current_outlet_id');

    const [uColumns] = await queryInterface.sequelize.query('DESCRIBE users;');
    const userColNames = uColumns.map(c => c.Field || c.column_name);
    const userOutletCol = findField(userColNames, 'outlet_id');

    const [transferColumns] = await queryInterface.sequelize.query('DESCRIBE transfer_records;');
    const transferColNames = transferColumns.map(c => c.Field || c.column_name);

    console.log('Discovered columns:', { cylinders: cylColNames, users: userColNames, transfer_records: transferColNames });

    const transferMap = {
      cylinder_id: findField(transferColNames, 'cylinder_id'),
      from_outlet_id: findField(transferColNames, 'from_outlet_id'),
      to_outlet_id: findField(transferColNames, 'to_outlet_id'),
      transferred_by_id: findField(transferColNames, 'transferred_by_id'),
      transfer_date: findField(transferColNames, 'transfer_date'),
      reason: findField(transferColNames, 'reason'),
      notes: findField(transferColNames, 'notes'),
      created_at: findField(transferColNames, 'created_at'),
      updated_at: findField(transferColNames, 'updated_at')
    };


    // Get outlets
    const outlets = await queryInterface.sequelize.query(
      `SELECT id FROM outlets WHERE status = 'active' ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (outlets.length < 2) {
      console.log('Not enough outlets to create transfer records');
      return;
    }

    // Get staff members who can perform transfers
    const staff = await queryInterface.sequelize.query(
      `SELECT id, ${userOutletCol || 'id'} as outlet_id FROM users WHERE role IN ('admin', 'staff') ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get some cylinders to transfer
    const cylinders = await queryInterface.sequelize.query(
      `SELECT id, ${cylOutletCol} as current_outlet_id FROM cylinders WHERE status = 'available' ORDER BY id LIMIT 10`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const transferRecords = [];
    const now = new Date();

    for (const cylinder of cylinders) {
      // Create 1-2 transfer records per cylinder
      const numTransfers = Math.floor(Math.random() * 2) + 1;
      let currentOutletId = cylinder.current_outlet_id;

      for (let i = 0; i < numTransfers; i++) {
        // Find a different outlet to transfer to
        const otherOutlets = outlets.filter(o => o.id !== currentOutletId);
        if (otherOutlets.length === 0) continue;

        const toOutlet = otherOutlets[Math.floor(Math.random() * otherOutlets.length)];
        const transferringStaff = staff.find(s => s.outlet_id === currentOutletId) || staff[0];
        const transferDate = new Date(now.getTime() - (i * 20 + Math.random() * 30) * 24 * 60 * 60 * 1000);

        const reasons = [
          'Stock balancing',
          'Customer request',
          'Inventory optimization',
          'Outlet shortage',
          'Seasonal demand'
        ];

        const transferData = {
          cylinder_id: cylinder.id,
          from_outlet_id: currentOutletId,
          to_outlet_id: toOutlet.id,
          transferred_by_id: transferringStaff.id,
          transfer_date: transferDate,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          notes: i === 0 ? `Transferred from outlet ${currentOutletId} to outlet ${toOutlet.id}` : null
        };

        const mapped = {};
        Object.keys(transferData).forEach(key => {
          mapped[transferMap[key]] = transferData[key];
        });
        mapped[transferMap.created_at] = transferDate;
        mapped[transferMap.updated_at] = transferDate;
        transferRecords.push(mapped);

        // Update current outlet for next transfer
        currentOutletId = toOutlet.id;
      }

      // Update the cylinder's current outlet to match the last transfer
      if (transferRecords.length > 0) {
        const lastTransfer = transferRecords[transferRecords.length - 1];
        const lastToOutletId = lastTransfer[transferMap.to_outlet_id] || lastTransfer.toOutletId || lastTransfer.to_outlet_id;
        await queryInterface.sequelize.query(
          `UPDATE cylinders SET ${cylOutletCol} = ${lastToOutletId} WHERE id = ${cylinder.id}`
        );
      }
    }

    if (transferRecords.length > 0) {
      // Sort by date to ensure proper ordering
      transferRecords.sort((a, b) => {
        const dateA = a[transferMap.transfer_date] || a.transferDate || a.transfer_date;
        const dateB = b[transferMap.transfer_date] || b.transferDate || b.transfer_date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

      await queryInterface.bulkInsert('transfer_records', transferRecords, {});
    }

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transfer_records', null, {});
  }
};