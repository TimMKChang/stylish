'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    provider: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: 'native'
    },
    created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now()
    },
  }, {
    timestamps: false
  });
  User.associate = function (models) {
    // associations can be defined here
  };
  return User;
};