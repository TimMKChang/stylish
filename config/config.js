require('dotenv').config();
module.exports = {
  development: {
    username: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB,
    host: process.env.SQL_HOST,
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: false
    },
    pool: {
      max: 5,
      min: 0,
      // The maximum time, in milliseconds, that pool will try to get connection before throwing error
      acquire: 30000,
      // The maximum time, in milliseconds, that a connection can be idle before being released.
      idle: 10000
    }
  }
};