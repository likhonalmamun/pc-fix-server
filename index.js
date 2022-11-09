const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const reviewCollection = client.db("assignment-11").collection("reviews");

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send({ result });
    });
    app.get("/reviews/:sid", async (req, res) => {
      const cursor = reviewCollection.find({ serviceId: req.params.sid });
      const reviews = await cursor.toArray();
      // console.log(reviews);
      res.send({ reviews });
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({ reviewerEmail: req.query.email });
      const reviews = await cursor.toArray();
      console.log(reviews);
      res.send({ reviews });
    });
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.limit(3).toArray();

      res.send({ services });
    });
    app.get("/services/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const service = await servicesCollection.findOne(query);
      res.json({ service });
    });
    app.get("/allServices", async (req, res) => {
      const cursor = servicesCollection.find({});
      const allServices = await cursor.toArray();
      // console.log(allServices[0]);
      res.send({ allServices });
    });
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send({ result });
    });
  } catch {
    (err) => console.log(err);
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {});
