'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      category: {
        allowNull: false,
        type: Sequelize.STRING
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING
      },
      price: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      texture: {
        allowNull: false,
        type: Sequelize.STRING
      },
      wash: {
        allowNull: false,
        type: Sequelize.STRING
      },
      place: {
        allowNull: false,
        type: Sequelize.STRING
      },
      note: {
        allowNull: false,
        type: Sequelize.STRING
      },
      story: {
        allowNull: false,
        type: Sequelize.STRING
      },
      sizes: {
        allowNull: false,
        type: Sequelize.STRING
      },
      main_image: {
        allowNull: false,
        type: Sequelize.STRING
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Products');
  }
};