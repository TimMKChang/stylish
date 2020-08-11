'use strict';
module.exports = (sequelize, DataTypes) => {
  const OtherImage = sequelize.define('OtherImage', {
    image: DataTypes.STRING
  }, {
    timestamps: false
  });
  OtherImage.associate = function (models) {
    // associations can be defined here
    OtherImage.belongsTo(models.Product, { foreignKey: 'product_id' });
  };
  return OtherImage;
};