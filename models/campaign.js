'use strict';
module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define('Campaign', {
    product_id: DataTypes.BIGINT.UNSIGNED,
    picture: DataTypes.STRING,
    story: DataTypes.STRING
  }, {
    timestamps: false
  });
  Campaign.associate = function (models) {
    // associations can be defined here
  };
  return Campaign;
};