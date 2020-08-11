'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    texture: {
      type: DataTypes.STRING,
      allowNull: false
    },
    wash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    place: {
      type: DataTypes.STRING,
      allowNull: false
    },
    note: {
      type: DataTypes.STRING,
      allowNull: false
    },
    story: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sizes: {
      type: DataTypes.STRING,
      allowNull: false
    },
    main_image: {
      type: DataTypes.STRING,
      allowNull: false
    },

  }, {
    timestamps: false
  });
  Product.associate = function (models) {
    Product.belongsToMany(models.Color, {
      as: 'colors',
      through: 'ProductColors',
      foreignKey: 'product_id'
    });
    Product.hasMany(models.Variant, {
      as: 'variants',
      foreignKey: 'product_id',
      // onDelete: 'CASCADE',
      // hooks: true
    });
    Product.hasMany(models.OtherImage, {
      as: 'images',
      foreignKey: 'product_id',
      // onDelete: 'CASCADE',
      // hooks: true
    });
  };
  return Product;
};
