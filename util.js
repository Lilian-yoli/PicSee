const { networkInterfaces } = require("os");
const nets = networkInterfaces();

const getIp = () => {
  let results = "";
  for (const name of Object.keys(nets)) {
    console.log("name", name);
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        results = net.address;
      }
    }
  }
  console.log(results);
  return results;
};

const sendStatus = (rateLimiter, res) => {
  if (rateLimiter > 0) {
    res.status(200).send({ counter: rateLimiter });
  } else if (rateLimiter < 0) {
    res.status(429).send({ error: "over limitation" });
  }
};

module.exports = {
  getIp,
  sendStatus
};
