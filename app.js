const express = require("express");
const app = express();
const { checkLimitation, saveLimitList, getClientLimit } = require("./redis");
const ip = require("ip");

app.use(express.json());

app.get("/", async (req, res) => {
  const { user } = req.query;
  if (!user) {
    const rateLimiter = await checkLimitation(ip.address(), 5);
    sendStatus(rateLimiter, res);
  } else if (user !== "admin") {
    // setup rate limiter
    const limit = await getClientLimit(user);
    const rateLimiter = await checkLimitation(user, limit);
    sendStatus(rateLimiter, res);
  } else {
    res.status(200).send({ counter: "unlimited" });
  }
});

app.post("/limit", (req, res) => {
  const { user, limit } = req.body;
  const clientLimit = {};
  clientLimit[user] = limit;
  saveLimitList(clientLimit);
});

const sendStatus = (rateLimiter, res) => {
  if (rateLimiter > 0) {
    res.status(200).send({ counter: rateLimiter });
  } else if (rateLimiter < 0) {
    res.status(429).send({ error: "over limitation" });
  }
};

app.listen("3000", () => {
  console.log("Listening on port: 3000");
});

module.exports = app;
