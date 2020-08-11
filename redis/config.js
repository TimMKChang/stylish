// require('dotenv').config();
const client = connectRedis();
module.exports.client = client;

function connectRedis() {
  // to check redis used in the environment
  if (process.env.REDIS) {
    // redis
    const redis = require("redis");
    const bluebird = require("bluebird");
    bluebird.promisifyAll(redis.RedisClient.prototype);
    bluebird.promisifyAll(redis.Multi.prototype);
    const client = redis.createClient();

    client.on('connect', function (err) {
      console.log('Connected to redis successfully.');
    });
    client.on('error', function (err) {
      console.log('Error: Fail to connect to redis. ' + err);
    });

    return client;

  } else {
    console.log('Error: redis is not used in the environment.');
    return { ready: false };

  }

}