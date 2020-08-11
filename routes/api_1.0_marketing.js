const express = require('express');
const router = express.Router();

// redis
const { client } = require('../redis/config.js');

const { Campaign } = require('../models');

router.get('/', (req, res) => {
  return res.redirect('/api/1.0/marketing/campaigns');
});

router.get('/campaigns', async (req, res) => {
  const { status, error, campaigns } = await getCampaigns();

  if (error) {
    return res.status(status).json({ error });
  }
  return res.status(status).json(campaigns);

});

module.exports = router;

async function getCampaigns() {
  // check redis
  if (client.ready) {
    const campaigns_redis_str = await client.getAsync('campaigns');
    if (campaigns_redis_str) {
      const campaigns_redis = JSON.parse(campaigns_redis_str);
      console.log('data from redis');
      return { status: 200, campaigns: campaigns_redis };
    }
  }

  return await Campaign.findAll({
    order: [['id', 'ASC']],
  }).then(async (campaigns) => {

    // check if there is no campaign can be found
    if (campaigns.length === 0) {
      return { status: 400, error: 'There is no campaign can be found' };
    }

    const resObj = { data: campaigns };

    if (client.ready) {
      // set redis
      await client.setAsync('campaigns', JSON.stringify(resObj));
      // set expire 1 day
      client.expire('campaigns', 86400);
      console.log('data from database');
    }

    return { status: 200, campaigns: resObj };

  }).catch((error) => {
    return { status: 500, error: 'Server error' };

  });
}