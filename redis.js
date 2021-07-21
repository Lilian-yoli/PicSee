/* eslint-disable promise/param-names */
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
    redisClient.incr(key, (_err, reply) => {
      resv(reply);
    });
  });
}

function getLimit (key) {
  return new Promise((resv, rej) => {
    redisClient.hget("clientLimitList", key, (err, val) => {
      if (err) {
        rej(err);
      } else {
        resv(val);
      }
    });
  });
}

const checkLimitation = async (user, limit) => {
  let res = "";
  console.log("limit", limit);
  try {
    res = await inrcCache(user);
  } catch (err) {
    console.log("isOverLimit: could not increment key");
    throw err;
  }
  console.log(`${user} has value: ${res}`);
  const overLimit = -1;
  if (res > limit) {
    return overLimit;
  }
  redisClient.expire(user, 600);

  return res;
};

const saveLimitList = (userLimit) => {
  const key = redisClient.hgetall("clientLimitList", (err, val) => {
    if (err) {
      console.log(err);
    } else {
      console.log(val);
    }
  });
  if (!key) {
    redisClient.hmset("clientLimitList", userLimit, (err, reply) => {
      if (err) {
        console.log(err);
      }
      console.log(reply);
    });
  } else {
    redisClient.hset("clientLimitList", userLimit);
  }
};

const getClientLimit = async (user) => {
  const key = await getLimit(user);
  console.log(key);
  return key;
};

module.exports = {
  checkLimitation,
  saveLimitList,
  getClientLimit
};
