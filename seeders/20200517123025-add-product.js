'use strict';

const { Op } = require('sequelize');
const { Product, Color, ProductColor, Variant, Campaign } = require('../models');
const product_all = require('./products.json').data;

let image_url = process.env.AWS_CLOUDFRONT_DOMAIN;

// unique color
const color_obj = {};
for (const product of product_all) {
  const colors = product.colors;
  for (const color of colors) {
    color_obj[color.name] = color.code;
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {

    async function createProduct(_product) {
      const { id, category, title, description, price, texture, wash, place, note, story, sizes, images, colors, variants } = _product;

      // due to duplicate images
      const other_image_amount = [...new Set(images)].length;

      const main_image = `${image_url}/assets/${id}/main.jpg`;

      // Products
      const product = await Product.create({
        id,
        category,
        title,
        description,
        price,
        texture,
        wash,
        place,
        note,
        story,
        sizes: sizes.join(','),
        main_image
      });

      // ProductColors
      for (let _color of colors) {
        const code = _color.code;
        const color = await Color.findOne({ where: { code } });
        await createProductColor(product.id, color.id);
      }

      // Variants
      for (let _variant of variants) {
        const { color_code, size, stock } = _variant;
        await createVariant(color_code, size, stock, product.id);
      }

      // OtherImages
      for (let i = 1; i <= other_image_amount; i++) {
        // await createVariant(color_code, size, stock, product.id);
        const image = `${image_url}/assets/${product.id}/${i}.jpg`;
        await createOtherImage(image, product.id);
      }

    }

    async function createColor(name, code) {
      await queryInterface.bulkInsert('Colors', [{
        name,
        code
      }]);
    }

    async function createProductColor(product_id, color_id) {
      await queryInterface.bulkInsert('ProductColors', [{
        product_id,
        color_id
      }]);
    }

    async function createVariant(color_code, size, stock, product_id) {
      await queryInterface.bulkInsert('Variants', [{
        color_code,
        size,
        stock,
        product_id
      }]);
    }

    async function createOtherImage(image, product_id) {
      await queryInterface.bulkInsert('OtherImages', [{
        image,
        product_id
      }]);
    }

    try {
      // Color
      for (let name in color_obj) {
        const code = color_obj[name];
        await createColor(name, code);
      }

      // Product ProductColor Variant
      for (let product of product_all) {
        await createProduct(product);
      }

      return Promise.resolve();

    } catch (err) {
      return Promise.reject(err);
    }

  },



  down: async (queryInterface, Sequelize) => {

    const all_color_name = Object.keys(color_obj);
    const all_product_id = product_all.map((product) => product.id);

    try {

      await Color.findAll({
        where: {
          name: {
            [Op.in]: all_color_name,
          }
        }
      }).then(async (colors) => {
        for (let i = 0; i < colors.length; i++) {
          await colors[i].destroy();
        }
      });

      await Product.findAll({
        where: {
          id: {
            [Op.in]: all_product_id,
          }
        }
      }).then(async (products) => {
        for (let i = 0; i < products.length; i++) {
          await products[i].destroy();
        }
      });

      return Promise.resolve();

    } catch (err) {
      return Promise.reject(err);
    }

  }
};
