'use strict';

const { Op } = require('sequelize');
const { Campaign } = require('../models');
const campaign_all = require('./campaigns.json').data;

let image_url = process.env.AWS_CLOUDFRONT_DOMAIN;

async function createCampaign(_campaign) {
  const { id, product_id, picture, story } = _campaign;
  await Campaign.create({
    id,
    product_id,
    picture: `${image_url}/campaigns/${id}.jpg`,
    story
  });
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      for (let campaign of campaign_all) {
        await createCampaign(campaign);
      }

      return Promise.resolve();

    } catch (err) {
      return Promise.reject(err);
    }

  },

  down: async (queryInterface, Sequelize) => {

    try {
      await queryInterface.bulkDelete('Campaigns', [{
        id: {
          [Op.lte]: 3
        }
      }]);

      return Promise.resolve();

    } catch (err) {
      return Promise.reject(err);
    }

  }
};
