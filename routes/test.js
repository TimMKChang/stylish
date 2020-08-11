const express = require('express');
const router = express.Router();
const fs = require('fs');
const Path = require('path');

// redis
const { client } = require('../redis/config.js');

const { Product, Campaign } = require('../models');

// check authentication
router.use(require('../middleware/authenticate'));

router.get('/product/:id/delete', (req, res) => {

  if (req.params.id === 'all') {
    return res.send('This feature is closed');
  }

  // protect default product
  const product_all = require('../seeders/products.json').data;
  const id_array = product_all.map((product) => product.id);
  if (id_array.includes(+req.params.id)) {
    return res.json({ message: `id: ${req.params.id} product is default product Can not be deleted` });
  }

  Product.findByPk(req.params.id)
    .then(async (product) => {
      if (product) {

        product.destroy();

        // delete redis key when deleting product
        if (client.ready) {
          await client.delAsync(`product-${req.params.id}`);
          console.log(`delete redis key product-${req.params.id}`);
        }

        return res.json({ message: `deleted id: ${req.params.id} product` });
      }
      return res.json({ message: `id: ${req.params.id} product does not exist` });
    });
});

router.get('/campaign/:id/delete', (req, res) => {
  // protect default campaign
  const campaign_all = require('../seeders/campaigns.json').data;
  const id_array = campaign_all.map((campaign) => campaign.id);
  if (id_array.includes(+req.params.id)) {
    return res.json({ message: `id: ${req.params.id} campaign is default campaign Can not be deleted` });
  }

  Campaign.findByPk(req.params.id)
    .then(async (campaign) => {
      if (campaign) {

        campaign.destroy();

        // delete redis key when deleting campaign
        if (client.ready) {
          await client.delAsync('campaigns');
        }

        return res.json({ message: `deleted id: ${req.params.id} campaign` });
      }
      return res.json({ message: `id: ${req.params.id} campaign does not exist` });
    });
});

module.exports = router;
