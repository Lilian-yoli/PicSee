const express = require("express");
const app = express();
const { checkLimitation, saveLimitList, getClientLimit } = require("./redis");
const ip = require("ip");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/:id", async (req, res) => {
  const { user } = req.query;
  const { id } = req.params;
  // 1. if user does not existed
  if (!user) {
    const rateLimiter = await checkLimitation(ip.address(), 5);
    sendStatus(rateLimiter, res);
  // 2. if user existed but not admin
  } else if (user !== "admin") {
    const limit = await getClientLimit(user);
    const rateLimiter = await checkLimitation(user + id, limit);
    sendStatus(rateLimiter, res);
  // 3. if user is admin
  } else {
    res.status(200).send({ counter: "unlimited" });
  }
});

// save limit times of each client
app.post("/clientlimit", (req, res) => {
  const { user, limit } = req.body;
  const clientLimit = {};
  clientLimit[user] = limit;
  saveLimitList(clientLimit);
});

// send status back based on rateLimiter
const sendStatus = (rateLimiter, res) => {
  if (rateLimiter > 0) {
    res.status(200).send({ counter: rateLimiter + "times" });
  } else if (rateLimiter < 0) {
    res.status(429).send({ error: "over limitation" });
  }
};

// set ratelimiter as middleware
const retelimiter = () => {
  return async function (req, res, next) {
    const { user } = req.query;
    const { id } = req.params;
    if (!user) {
      const rateLimit = await checkLimitation(ip.address(), 5);
      if (rateLimit < 0) {
        res.status(429).send({ error: "over limitation" });
      } else {
        const counter = { counter: rateLimit + " times" };
        req.counter = counter;
        next();
      }
    } else if (user !== "admin") {
    // setup rate limiter
      const limit = await getClientLimit(user);
      const rateLimit = await checkLimitation(user + id, limit);
      if (rateLimit < 0) {
        res.status(429).send({ error: "over limitation" });
      } else {
        const counter = { counter: rateLimit + " times" };
        req.counter = counter;
        next();
      }
    } else {
      const counter = { counter: "unlimited" };
      req.counter = counter;
      next();
    }
  };
};

app.get("/test", retelimiter(), (req, res) => {
  console.log("test", req.counter);
});

app.listen("3000", () => {
  console.log("Listening on port: 3000");
});

module.exports = app;
