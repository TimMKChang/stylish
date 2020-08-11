const express = require('express');
const router = express.Router();

// redis
const { client } = require('../redis/config.js');

const { OrderRecord, Variant } = require('../models');

const fetch = require('node-fetch');

router.post('/checkout', async (req, res) => {

  // check Content-Type
  if (!req.is('application/json')) {
    return res.status(400).json({ error: 'Incorrect Content-Type.' });
  }

  // update variant
  const { list } = req.body.order;
  for (const product of list) {
    try {
      const { id, size, color, qty } = product;
      const { code } = color;

      const variant = await Variant.findOne({
        where: {
          product_id: id,
          size,
          color_code: code
        }
      })
      variant.stock -= qty;

      if (variant.stock < 0) {
        return res.status(500).json({ error: 'Product sold out' });
      }

      await variant.save();

      // delete redis key when updating product
      if (client.ready) {
        await client.delAsync(`product-${id}`);
        console.log(`delete redis key product-${id}`);
      }

    } catch (err) {
      return res.status(500).json({ error: 'Server error' });

    }
  }

  let orderRecord;
  try {
    const order_record = JSON.stringify(req.body);
    const { total } = req.body.order;

    const now = new Date();
    const number = '' + now.getFullYear() + ('0' + (now.getMonth() + 1)).substr(-2) + ('0' + now.getDate()).substr(-2) + ('0000000' + (now % (24 * 60 * 60 * 1000))).substr(-8) + Math.floor(Math.random() * 10);

    orderRecord = await OrderRecord.create({ id: number, total, order_record });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }

  const orderNumber = orderRecord.id;

  // tappay
  const tappay_res = await tappay_pay_prime(req.body);

  if (tappay_res.status === 0) {
    // update order
    try {
      orderRecord.paid = true;
      orderRecord.payment_record = JSON.stringify(tappay_res);
      await orderRecord.save();
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    // example number, send OrderRecord id as order number
    return res.json({ data: { number: orderNumber } });

  } else {
    orderRecord.payment_record = JSON.stringify(tappay_res);
    orderRecord.save();
    return res.json(tappay_res);

  }

});

module.exports = router;

async function tappay_pay_prime(order_record) {

  const { prime, order } = order_record;
  const { total, recipient } = order;
  const { name, email, address } = recipient;
  phone_number = recipient.phone;

  // pay data
  const url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime';

  // example
  const data = {
    prime,
    partner_key: process.env.TAPPAY_partner_key,
    merchant_id: process.env.TAPPAY_merchant_id,
    details: 'TapPay Test',
    amount: total,
    cardholder: {
      phone_number,
      name,
      email,
      address
    },
    remember: true
  };

  return await fetch(url, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.TAPPAY_partner_key
    },
  })
    .then(res => res.json())
    .then(json => {
      // const string_json = JSON.stringify(json);
      // console.log(JSON.parse(string_json));
      return json;
    });
}