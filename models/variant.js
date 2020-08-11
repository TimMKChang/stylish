'use strict';
module.exports = (sequelize, DataTypes) => {
  const Variant = sequelize.define('Variant', {
    color_code: DataTypes.STRING,
    size: DataTypes.STRING,
    stock: DataTypes.INTEGER
  }, {
    timestamps: false
  });
  Variant.associate = function (models) {
    // associations can be defined here
    Variant.belongsTo(models.Product, { foreignKey: 'product_id' });
  };
  return Variant;
};