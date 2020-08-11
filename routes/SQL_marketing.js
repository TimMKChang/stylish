const express = require('express');
const router = express.Router();
const { transaction, commit, rollback, query } = require('../util/mysqlcon.js');

router.route('/campaigns')
  .get(controller_getCampaigns)
  .post(controller_createCampaigns);

module.exports = router;

// controller
async function controller_getCampaigns(req, res) {
  let campaigns;
  try {
    campaigns = await model_getCampaigns();
  } catch (error) {
    return res.status(status).json({ error });
  }

  return res.status(200).json({ data: campaigns });
}

async function controller_createCampaigns(req, res) {
  const { id, product_id, picture, story, sql_code } = req.body;
  if (sql_code !== process.env.SQL_CODE) {
    return res.status(401).send('Authentication code is wrong');
  }
  const campaign = {
    id,
    product_id,
    picture,
    story
  }
  const { error, message } = await model_createCampaigns(campaign);
  if (error) {
    return res.send(error);
  }
  return res.send(message);
}

// model
async function model_getCampaigns() {
  return await query('SELECT * FROM campaigns', []);
}

async function model_createCampaigns(campaign) {
  try {
    await transaction();
    await query('INSERT INTO campaigns SET ?', campaign);
    await commit();
  } catch (error) {
    await rollback();
    return { error: 'Fail to create campaign' };
  }

  return { message: 'Create campaign successfully' };
}
