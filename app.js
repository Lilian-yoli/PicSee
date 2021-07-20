const express = require("express");
const app = express();
const { checkLimitation } = require("./redis");
const { getIp, sendStatus } = require("./util");

app.use(express.json());

app.get("/", async (req, res) => {
  const { user } = req.query;
  if (!user) {
    const ip = getIp();
    const rateLimiter = await checkLimitation(ip);
    sendStatus(rateLimiter, res);
  } else if (user !== "admin") {
    // setup rate limiter
    const rateLimiter = await checkLimitation(user);
    sendStatus(rateLimiter, res);
  } else {
    res.status(200).send({ counter: "unlimited" });
  }
});

app.listen("3000", () => {
  console.log("Listening on port: 3000");
});

module.exports = app;
