const { sequelize } = require('./models');
const count = 5000;

main(count);

async function main(count) {
  await sequelize.query('DELETE FROM OrderRecords;');
  const str = createLargeInsertString(count);
  await sequelize.query(str);
}

function createLargeInsertString(count) {
  let str = 'INSERT INTO `OrderRecords` (`id`, `user_id`, `total`, `created_time`) values';
  let values = [];
  for (let i = 1; i <= count; i++) {
    const user_id = Math.floor(Math.random() * 5) + 1;
    const total = Math.floor(Math.random() * 901) + 100;
    values.push(`(${i}, ${user_id}, ${total}, '2020-06-10 12:00:00')`);
  }
  str += values.join(',');
  str += ';';
  return str;
}