'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('OrderRecords', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED
      },
      total: {
        type: Sequelize.INTEGER
      },
      order_record: {
        type: Sequelize.STRING(8000)
      },
      payment_record: {
        type: Sequelize.STRING(8000)
      },
      paid: {
        type: Sequelize.BOOLEAN,
      },
      created_time: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('OrderRecords');
  }
};