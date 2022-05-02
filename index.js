const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
//Connect to Database

function verifyToken(req, res, next) {
    let authHeaders = req.headers.authorization;

    if (!authHeaders) {
        return res.status(401).send({ message: "Unauthorized access" });
    }
    const token = authHeaders.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" });
        }

        // console.log("decoded", decoded);

        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.no9we.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
async function run() {
    try {
        await client.connect();
        const productCollection = client
            .db("bicycleStore")
            .collection("product");

        // Auth
        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(
                user,
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "1d",
                }
            );
            res.send({ accessToken });
        });

        // Get My Items
        app.get("/myitem", verifyToken, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get All items
        app.get("/inventory/countItem", async (req, res) => {
            const page = parseInt(req.query.page);
            const qty = parseInt(req.query.quantity);
            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if (page || qty) {
                products = await cursor
                    .skip(page * qty)
                    .limit(qty)
                    .toArray();
            } else {
                products = await cursor.toArray();
            }
            res.send(products);
        });

        // Count Data
        app.get("/productCount", async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
        });

        //Insert data from client
        app.post("/inventory", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send({ success: "Product added Successfully" });
        });

        //Load data from databse to client
        app.get("/inventory", async (req, res) => {
            const products = await productCollection.find({}).toArray();
            res.send(products);
        });

        // get data by IDs
        app.get("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // Update quantity
        app.put("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateQty = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: updateQty,
            };
            const editResult = await productCollection.updateOne(
                filter,
                updateDoc,
                options
            );

            res.send({ success: "Quantity updated successfully." });
        });

        // Delete
        app.delete("/inventory/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const deleteResult = await productCollection.deleteOne(query);

            res.send({ success: "Item Delete Successfully" });
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
