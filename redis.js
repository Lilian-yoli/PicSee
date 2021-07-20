const redis = require("redis");
const redisClient = redis.createClient({ host: "localhost", port: 6379 });

redisClient.on("ready", function () {
  console.log("Redis is ready");
});

redisClient.on("error", function (error) {
  console.error(error);
});

function inrcCache (key) {
  return new Promise((resv, rej) => {
    redisClient.incr(key, (err, reply) => {
      resv(reply);
    });
  });
}

async function checkLimitation (user) {
  let res = "";
  try {
    res = await inrcCache(user);
  } catch (err) {
    console.log("isOverLimit: could not increment key");
    throw err;
  }
  console.log(`${user} has value: ${res}`);
  const overLimit = -1;
  if (res > 5) {
    return overLimit;
  }
  redisClient.expire(user, 600);

  return res;
}

module.exports = {
  checkLimitation
};
