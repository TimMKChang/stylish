'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ProductColors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      product_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
          // as: 'product_id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      color_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Colors',
          key: 'id',
          // as: 'color_id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ProductColors');
  }
};