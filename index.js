const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
//Connect to Database

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.no9we.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
async function run() {
    try {
        await client.connect();
        console.log("db connect");
        const productCollection = client
            .db("bicycleStore")
            .collection("product");

        app.post("/product", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            console.log(result);
            res.send({ success: "Product added Successfully" });
        });
        app.get("/product", async (req, res) => {
            const products = await productCollection.find({}).toArray();
            res.send(products);
        });
    } finally {
    }
}
run().catch(console.dir());

//Root
app.get("/", (req, res) => {
    res.send(`Welcome to BiCycle Store.`);
});

//Listen PORT
app.listen(port, () => {
    console.log(`BiCycle-store-server running ${port}`);
});
