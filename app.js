const express = require("express");
const app = express();
const {redisClient, get, set} = require("./redis");


app.use(express.json());

app.get("/", async (req, res) =>{
    console.log(req.query);
    const {user} = req.query;
    if(user === "admin"){

    }

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
        res.status(429).send("over limitation")
    } else {
        counter = ratelimitCount + 1
        
    }

    if()
    res.status(200).send("Hello World");

});

app.post("/test", async (req, res) =>{
    console.log(req.body);
    res.status(200).send(req.body);

});



app.post("/api/1.0/shorturl", async (req, res) =>{
    try {
        const data = req.body;
        const shortUrlInfo = await shortUrl(data);
        console.log(shortUrlInfo);
        res.status(200).send(shortUrlInfo);
    } catch (err) {
        console.log(err);
    }
});

async function shortUrl(urldata){
    // urldata = {
    //     url:"https://co-car.site",
    //     externalId:"customer_test_1",
    //     title:"PicSee 皮克看見 Customized Title",
    //     description:"PicSee Customized Description",
    //     imageUrl:"https://picsee.co/images/domain_long.png"
    // };
    const {data} = await axios.post("https://api.pics.ee/v1/links/?access_token=20f07f91f3303b2f66ab6f61698d977d69b83d64", urldata);
    console.log(data);
    return data;
} 

// shortUrl()

async function performance(){
    const { data } = await axios.get("https://api.pics.ee/v1/links/3kexy9/overview?access_token=20f07f91f3303b2f66ab6f61698d977d69b83d64");
    console.log(data);
}

// performance();

app.listen("3000", () => {
    console.log("Listening on port: 3000");
});

module.exports = app;