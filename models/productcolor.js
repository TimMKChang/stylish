'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProductColor = sequelize.define('ProductColor', {
    product_id: DataTypes.BIGINT.UNSIGNED,
    color_id: DataTypes.BIGINT.UNSIGNED,
  }, {
    timestamps: false
  });
  ProductColor.associate = function (models) {
    // associations can be defined here
  };
  return ProductColor;
};