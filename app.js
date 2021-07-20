const express = require("express");
const app = express();
const {redisClient, get, set} = require("./redis");


app.use(express.json());

app.get("/", async (req, res) =>{
    console.log(req.query);
    const {user} = req.query;
    if(!user){
        res.status(401).send({error: "unauthorized"})
    } else if( user !== "admin"){
        // setup rate limiter
        const ratelimitCount = redisClient.get(user)
        let counter = ""
        if(!ratelimitCount){
            redisClient.set(user, JSON.stringify(routes), "EX", 600, err => {
                if (err) {
                console.log(err);
                } else {
                console.log("redis set successfully");
                }
            })
        } else if(ratelimitCount > 5){
            res.status(429).send({error: "over limitation"})
        } else {
            counter = ratelimitCount + 1
            
        }
    }

    res.status(200).send("");

});


app.listen("3000", () => {
    console.log("Listening on port: 3000");
});

module.exports = app;