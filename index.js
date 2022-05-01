const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

//Root
app.get("/", (req, res) => {
    res.send(`Welcome to BiCycle Store.`);
});

//Listen PORT
app.listen(port, () => {
    console.log(`BiCycle-store-server running ${port}`);
});
