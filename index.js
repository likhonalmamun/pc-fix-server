const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nbkl0so.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const servicesCollection = client
      .db("assignment-11")
      .collection("services");

    app.get("/", (req, res) => {
      res.send("server is working");
    });
  } catch {
    (err) => console.log(err);
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {});
