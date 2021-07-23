const express = require("express");
const app = express();
const { checkLimitation, saveLimitList, getClientLimit } = require("./redis");
const ip = require("ip");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const { user } = req.query;
  const { id } = req.params;
  // 1. if user does not existed
  if (!user) {
    const rateLimiter = await checkLimitation(ip.address(), 5);
    return res.status(rateLimiter.status).send(rateLimiter.message);
  // 2. if user existed but not admin
  } else if (user !== "admin") {
    const limit = await getClientLimit(user);
    const rateLimiter = await checkLimitation(user, limit);
    return res.status(rateLimiter.status).send(rateLimiter.message);
  // 3. if user is admin
  } else {
    res.status(200).send({ message: "unlimited" });
  }
});

// save limit times of each client
app.post("/clientlimit", (req, res) => {
  const { user, limit } = req.body;
  const clientLimit = {};
  clientLimit[user] = limit;
  saveLimitList(clientLimit);
});

// set ratelimiter as middleware
const retelimiter = () => {
  return async function (req, res, next) {
    try {
      const { user } = req.query;
      const { id } = req.params;
      if (!user) {
        const rateLimit = await checkLimitation(ip.address(), 5);
        if (rateLimit.status == 429) {
          return res.status(rateLimit.status).send(rateLimit.message);
        } else {
          req.rate = rateLimit.message;
          next();
        }
      } else if (user !== "admin") {
        // setup rate limiter
        const limit = await getClientLimit(user);
        const rateLimit = await checkLimitation(user + id, limit);
        if (rateLimit.status == 429) {
          return res.status(rateLimit.status).send(rateLimit.message);
        } else {
          req.rate = rateLimit.message;
          next();
        }
      } else {
        req.rate = "unlimited";
        next();
      }
    } catch (err) {
      console.log(err);
      next();
    }
  };
};

app.get("/test", retelimiter(), (req, res) => {
  console.log("test", req.counter);
  res.sendStatus(200).send(req.counter);
});

app.listen("3000", () => {
  console.log("Listening on port: 3000");
});

module.exports = app;
