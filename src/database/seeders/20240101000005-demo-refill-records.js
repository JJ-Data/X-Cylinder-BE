'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if data already exists
    const [existingRefills] = await queryInterface.sequelize.query(
      'SELECT id FROM refill_records LIMIT 1;'
    );

    if (existingRefills.length > 0) {
      console.log('Refill records already exist. Skipping demo seeding...');
      return;
    }

    // Discover column names for cylinders, users, and refill_records
    const [cylColumns] = await queryInterface.sequelize.query('DESCRIBE cylinders;');
    const cylColNames = cylColumns.map(c => c.Field || c.column_name);
    const cylOutletCol = cylColNames.includes('current_outlet_id') ? 'current_outlet_id' : 'currentOutletId';
    const cylMaxCol = cylColNames.includes('max_gas_volume') ? 'max_gas_volume' : 'maxGasVolume';
    const cylCurCol = cylColNames.includes('current_gas_volume') ? 'current_gas_volume' : 'currentGasVolume';

    const [userColumns] = await queryInterface.sequelize.query('DESCRIBE users;');
    const userColNames = userColumns.map(c => c.Field || c.column_name);
    const userOutletCol = userColNames.includes('outlet_id') ? 'outlet_id' : (userColNames.includes('outletId') ? 'outletId' : null);

    const [refillColumns] = await queryInterface.sequelize.query('DESCRIBE refill_records;');
    const refillColNames = refillColumns.map(c => c.Field || c.column_name);

    const refillMap = {
      cylinder_id: refillColNames.includes('cylinder_id') ? 'cylinder_id' : 'cylinderId',
      operator_id: refillColNames.includes('operator_id') ? 'operator_id' : 'operatorId',
      outlet_id: refillColNames.includes('outlet_id') ? 'outlet_id' : 'outletId',
      refill_date: refillColNames.includes('refill_date') ? 'refill_date' : 'refillDate',
      pre_refill_volume: refillColNames.includes('pre_refill_volume') ? 'pre_refill_volume' : 'preRefillVolume',
      post_refill_volume: refillColNames.includes('post_refill_volume') ? 'post_refill_volume' : 'postRefillVolume',
      refill_cost: refillColNames.includes('refill_cost') ? 'refill_cost' : 'refillCost',
      batch_number: refillColNames.includes('batch_number') ? 'batch_number' : 'batchNumber',
      notes: 'notes',
      created_at: refillColNames.includes('created_at') ? 'created_at' : 'createdAt',
      updated_at: refillColNames.includes('updated_at') ? 'updated_at' : 'updatedAt'
    };

    // Get refill operators
    const operators = await queryInterface.sequelize.query(
      `SELECT id, ${userOutletCol || 'id'} as outlet_id FROM users WHERE role = 'refill_operator' ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get cylinders that need refilling or have been refilled
    const cylinders = await queryInterface.sequelize.query(
      `SELECT id, ${cylOutletCol} as current_outlet_id, ${cylMaxCol} as max_gas_volume, ${cylCurCol} as current_gas_volume FROM cylinders ORDER BY id LIMIT 30`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const refillRecords = [];
    const now = new Date();

    cylinders.forEach((cylinder, index) => {
      // Find an operator from the same outlet
      const operator = operators.find(op => op.outlet_id === cylinder.current_outlet_id) || operators[0];

      // Generate 1-3 refill records per cylinder
      const numRefills = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numRefills; i++) {
        const refillDate = new Date(now.getTime() - (i * 30 + Math.random() * 20) * 24 * 60 * 60 * 1000);
        const preRefillVolume = parseFloat((Math.random() * cylinder.max_gas_volume * 0.3).toFixed(2));
        const postRefillVolume = parseFloat((cylinder.max_gas_volume * (0.9 + Math.random() * 0.1)).toFixed(2));
        const volumeAdded = parseFloat((postRefillVolume - preRefillVolume).toFixed(2));
        const costPerKg = 50;
        const refillCost = parseFloat((volumeAdded * costPerKg).toFixed(2));

        const refillData = {
          cylinder_id: cylinder.id,
          operator_id: operator.id,
          outlet_id: cylinder.current_outlet_id,
          refill_date: refillDate,
          pre_refill_volume: preRefillVolume,
          post_refill_volume: postRefillVolume,
          refill_cost: refillCost,
          notes: i === 0 ? 'Regular refill' : null,
          batch_number: `BATCH-${refillDate.getFullYear()}${String(refillDate.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
        };

        const mapped = {};
        Object.keys(refillData).forEach(key => {
          mapped[refillMap[key]] = refillData[key];
        });
        mapped[refillMap.created_at] = refillDate;
        mapped[refillMap.updated_at] = refillDate;
        refillRecords.push(mapped);
      }
    });

    if (refillRecords.length > 0) {
      // Sort by date to ensure proper ordering
      refillRecords.sort((a, b) => {
        const dateA = a[refillMap.refill_date] || a.refillDate || a.refill_date;
        const dateB = b[refillMap.refill_date] || b.refillDate || b.refill_date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

      await queryInterface.bulkInsert('refill_records', refillRecords, {});

      // Update cylinder current volumes based on the most recent refill
      for (const cylinder of cylinders) {
        const latestRefill = refillRecords
          .filter(r => (r[refillMap.cylinder_id] || r.cylinderId || r.cylinder_id) === cylinder.id)
          .sort((a, b) => {
            const dateA = a[refillMap.refill_date] || a.refillDate || a.refill_date;
            const dateB = b[refillMap.refill_date] || b.refillDate || b.refill_date;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          })[0];

        if (latestRefill) {
          const postVolume = latestRefill[refillMap.post_refill_volume] || latestRefill.postRefillVolume || latestRefill.post_refill_volume;
          await queryInterface.sequelize.query(
            `UPDATE cylinders SET ${cylCurCol} = ${postVolume} WHERE id = ${cylinder.id}`
          );
        }
      }
    }

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('refill_records', null, {});
  }
};