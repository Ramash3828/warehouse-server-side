const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
//Connect to Database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.no9we.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
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

        //Insert data from client
        app.post("/product", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send({ success: "Product added Successfully" });
        });

        //Load data from databse to client
        app.get("/product", async (req, res) => {
            const products = await productCollection.find({}).toArray();
            res.send(products);
        });

        // POST data by keys
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // Update quantity
        app.put("/product", async (req, res) => {
            const quantity = req.params.qty;
            console.log(quantity);
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
