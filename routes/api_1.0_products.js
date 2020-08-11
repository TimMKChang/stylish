const express = require('express');
const router = express.Router();

// redis
const { client } = require('../redis/config.js');

const { Product, Color, Variant, OtherImage } = require('../models');
const { Op } = require('sequelize');

let url = 'https://www.haboy.xyz';
if (process.env.PORT) {
  url = `http://localhost:${process.env.PORT}`;
}

router.get('/', (req, res) => {
  return res.redirect('/api/1.0/products/all');
});

router.get('/:feature', async (req, res, next) => {
  const feature = req.params.feature;
  const query = req.query;
  const { status, error, products } = await getProducts(feature, query);

  if (error) {
    return res.status(status).json({ error });
  }
  return res.status(status).json(products);

});

module.exports = router;


async function getProducts(feature, query) {
  // category, search, details
  // check
  const where_clause = {};

  if (feature.match(/^(all|women|men|accessories)$/i)) {
    let category = '.*';
    if (!feature.match(/all/i)) {
      category = feature.toLowerCase();
    }
    where_clause.category = {
      [Op.regexp]: `^${category}$`
    };

  } else if (feature.match(/^search$/i)) {
    const keyword = query.keyword || '^$';
    where_clause.title = {
      [Op.like]: `%${keyword}%`
    };

  } else if (feature.match(/^details$/i)) {
    const id = query.id || '^$';
    where_clause.id = {
      [Op.regexp]: `^${id}$`
    };

  } else {
    return { status: 400, error: `No this feature: ${feature}. Please refer to API Doc.` };
  }

  // check redis
  if (client.ready && feature.match(/^details$/i)) {
    const product_redis_str = await client.getAsync(`product-${query.id}`);
    if (product_redis_str) {
      const product_redis = JSON.parse(product_redis_str);
      console.log('data from redis');
      return { status: 200, products: product_redis };
    }
  }

  // paging check 
  let paging = query.paging || '0';
  if (!paging.match(/^\d+$/)) {
    return { status: 400, error: 'Paging should be a number' };
  }
  paging = +paging;

  // number per page
  const number_per_page = 6;

  // count
  const product_count = await Product.count({
    where: where_clause
  }).catch((error) => {
    return { status: 500, error: 'Server error' };
  });

  // total page, starting from 0, so minus 1
  const total_paging = Math.ceil(product_count / number_per_page) - 1;

  // order limit offset
  return await Product.findAll({
    where: where_clause,
    attributes: ['id', 'title', 'description', 'price', 'texture', 'wash', 'place', 'note', 'story', 'sizes', 'main_image'],
    include: [{
      model: Color,
      attributes: ['code', 'name'],
      as: 'colors',
      through: { attributes: [] }
    },
    {
      model: Variant,
      attributes: ['color_code', 'size', 'stock'],
      as: 'variants'
    },
    {
      model: OtherImage,
      attributes: ['image'],
      as: 'images'
    }],
    order: [['id', 'ASC']],
    limit: number_per_page,
    offset: paging * number_per_page

  }).then(async (products) => {

    // check if there is no product can be found
    if (products.length === 0) {
      return { status: 400, error: 'There is no product can be found' };
    }

    for (let product_index = 0; product_index < products.length; product_index++) {
      // raw data nest
      products[product_index] = products[product_index].get({ plain: true });
      const product = products[product_index];

      product.sizes = product.sizes.split(',');

      product.images = product.images.map((obj) => obj.image);
    }

    // next_paging
    const resObj = {};
    if (paging < total_paging) {
      resObj.next_paging = paging + 1;
    }
    // details only return one product not an array
    if (feature.match(/^details$/i)) {
      resObj.data = products[0];
    } else {
      resObj.data = products;
    }

    // save key to redis
    if (client.ready && feature.match(/^details$/i) && products.length > 0) {
      // set redis
      await client.setAsync(`product-${query.id}`, JSON.stringify(resObj));
      // set expire 1 day
      client.expire(`product-${query.id}`, 86400);
      console.log('data from database');
    }

    return { status: 200, products: resObj };

  }).catch((error) => {
    return { status: 500, error: 'Server error' };

  });

}
