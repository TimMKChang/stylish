'use strict';

const { Op } = require('sequelize');
const { OrderRecord } = require('../models');
const fetch = require('node-fetch');

async function getOrderData() {
  const url = 'http://arthurstylish.com:1234/api/1.0/order/data';
  return await fetch(url)
    .then(res => res.json())
    .then(resObj => resObj);
}

async function createOrder(id, order) {

  const { total, list } = order;
  const order_record = {
    prime: 'hahahaha',
    order: {
      list
    },
  }

  await OrderRecord.create({
    id,
    user_id: 1,
    total,
    order_record: JSON.stringify(order_record),
    payment_record: '{"payment": "dummy_payment"}',
    paid: true,
  });
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {

      const orderData = await getOrderData();

      for (let record_id = 0; record_id < orderData.length; record_id++) {
        await createOrder(record_id + 1, orderData[record_id]);
      }

      return Promise.resolve();

    } catch (err) {
      return Promise.reject(err);
    }

  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('OrderRecords', [{
        id: {
          [Op.lte]: 5000
        }
      }]);

      return Promise.resolve();

    } catch (err) {
      return Promise.reject(err);
    }
  }
};
