/* eslint-disable promise/param-names */
const redis = require("redis");
const { promisify } = require("util");
const redisClient = redis.createClient({ host: "localhost", port: 6379 });

redisClient.on("ready", function () {
  console.log("Redis is ready");
});

redisClient.on("error", function (error) {
  console.error(error);
});

const get = promisify(redisClient.get).bind(redisClient);

function inrcCache (key) {
  return new Promise((resv, rej) => {
    redisClient.incr(key, (_err, reply) => {
      resv(reply);
    });
  });
}

function timeToLive (key) {
  return new Promise((resv, rej) => {
    redisClient.TTL(key, (_err, reply) => {
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
  const checkKey = await get(user);

  try {
    res = await inrcCache(user);
  } catch (err) {
    console.log("isOverLimit: could not increment key");
    throw err;
  }
  console.log(`${user} has value: ${res}`);
  if (res == 1) {
    redisClient.expire(user, 600);
  }
  const ttl = await timeToLive(user);
  console.log("ttl", ttl);
  const time = timeCount(ttl);
  if (res > limit) {
    return { status: 429, message: `over litmitation, usage available at ${time}` };
  }
  return { status: 200, message: `hit ${res} times in 10 mins` };
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

const timeCount = (ttl) => {
  const now = new Date();
  let mins = now.getMinutes() + Math.floor(ttl / 60);
  let hours = now.getHours();
  console.log("timeCount", mins, hours);
  if (mins >= 60) {
    mins = mins % 60;
    hours += 1;
  }
  return `${hours}:${mins}`;
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
