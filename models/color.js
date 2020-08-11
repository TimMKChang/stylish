'use strict';
module.exports = (sequelize, DataTypes) => {
  const Color = sequelize.define('Color', {
    name: DataTypes.STRING,
    code: DataTypes.STRING
  }, {
    timestamps: false
  });
  Color.associate = function (models) {
    // associations can be defined here
    // Color.belongsTo(models.Product);
    Color.belongsToMany(models.Product, {
      through: 'ProductColors',
      foreignKey: 'color_id'
    });
  };
  return Color;
};