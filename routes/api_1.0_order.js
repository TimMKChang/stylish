const express = require('express');
const router = express.Router();

const { query, transaction, commit, rollback } = require('../util/mysqlcon');

router.get('/payments', async (req, res) => {
  const { status, error, payments } = await getPayments();

  if (error) {
    return res.status(status).json({ error });
  }
  return res.status(status).json(payments);

});

router.get('/data', async (req, res) => {
  const { status, error, data } = await getData();

  if (error) {
    return res.status(status).json({ error });
  }
  return res.status(status).json(data);

});

module.exports = router;

async function getPayments() {

  try {
    const orderRecords = await query('SELECT user_id, SUM(total) AS total_payment FROM OrderRecords GROUP BY user_id ORDER BY user_id');

    const resObj = { data: orderRecords };

    return { status: 200, payments: resObj };

  } catch {
    return { status: 500, error: 'Server error' };
  }

}

async function getData() {
  try {
    const usedBefore = process.memoryUsage().heapUsed / 1024 / 1024;
    const orderRecords = await query('SELECT total, order_record FROM OrderRecords');
    const data = orderRecords.map((order) => {
      const { total, order_record } = order;
      const list = JSON.parse(order_record).order.list.map(product => {
        const { id, price, color, size, qty } = product;
        return { id, price, color, size, qty };
      })
      return {
        total,
        list
      }
    })
    const usedAfter = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round((usedAfter - usedBefore) * 100) / 100} MB`);

    return { status: 200, data };

  } catch {
    return { status: 500, error: 'Server error' };
  }

}


