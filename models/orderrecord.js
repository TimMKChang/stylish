'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderRecord = sequelize.define('OrderRecord', {
    user_id: DataTypes.BIGINT.UNSIGNED,
    total: DataTypes.INTEGER,
    order_record: DataTypes.STRING,
    payment_record: DataTypes.STRING,
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now()
    }
  }, {
    timestamps: false
  });
  OrderRecord.associate = function (models) {
    // associations can be defined here
  };
  return OrderRecord;
};