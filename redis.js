const redis = require("redis");
const redisClient = redis.createClient({ host: "localhost", port: 6379 });

redisClient.on("ready", function () {
  console.log("Redis is ready");
});

redisClient.on("error", function (error) {
    console.error(error);
  });

  const get = promisify(redisClient.get).bind(redisClient);
  const set = promisify(redisClient.set).bind(redisClient);

module.exports = {
    redisClient,
    get,
    set
};