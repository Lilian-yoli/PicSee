const express = require("express");
const app = express();
const { checkLimitation } = require("./redis");

app.use(express.json());

app.get("/", async (req, res) => {
  console.log(req.query);
  const { user } = req.query;
  if (!user) {
    res.status(401).send({ error: "unauthorized" });
  } else if (user !== "admin") {
    // setup rate limiter
    const rateLimiter = await checkLimitation(user);

    if (rateLimiter < 0) {
      res.status(429).send({ error: "over limitation" });
    } else {
      res.status(200).send({ counter: rateLimiter });
    }
  } else {
    res.status(200).send({ counter: "unlimited" });
  }
});

app.listen("3000", () => {
  console.log("Listening on port: 3000");
});

module.exports = app;
