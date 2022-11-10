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

function verifyJwt(req, res, next) {
  const token = req.headers.authentication.split(" ")[1];
  if (!req.headers.authentication) {
    return res.status(401).send({ message: "Unauthorized request !!" });
  }
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized request !!" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
}
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
      const reviews = await cursor.sort({ time: -1 }).toArray();
      // console.log(reviews);
      res.send({ reviews });
    });
    app.get("/edit/:id", async (req, res) => {
      const review = await reviewCollection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.send({ review });
    });

    app.get("/reviews", verifyJwt, async (req, res) => {
      const decoded = req.decoded;
      // console.log(decoded);
      if (!decoded.email === req.query.email) {
        return res.status(403).send({ message: "Forbidden request !" });
      }
      const cursor = reviewCollection.find({
        reviewerEmail: req.query.email,
      });
      const reviews = await cursor.sort({ time: -1 }).toArray();
       res.send({ reviews });
     
    });
    app.delete("/reviews/:id", async (req, res) => {
      const id = ObjectId(req.params.id);
      const result = await reviewCollection.deleteOne({ _id: id });
      res.send({ result });
    });
    app.patch("/review/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const options = { upsert: true };
      const newDoc = {
        $set: {
          text: req.body.newText,
        },
      };
      const result = await reviewCollection.updateOne(query, newDoc, options);
      res.send({ result });
    });
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.sort({ time: -1 }).limit(3).toArray();

      res.send({ services });
    });
    app.get("/services/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const service = await servicesCollection.findOne(query);
      res.json({ service });
    });
    app.get("/allServices", async (req, res) => {
      const cursor = servicesCollection.find({});
      const allServices = await cursor.sort({ time: -1 }).toArray();
      // console.log(allServices[0]);
      res.send({ allServices });
    });
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send({ result });
    });
    // token generation in login
    app.post("/jwt", async (req, res) => {
      const payload = req.body;
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      // console.log(token);
      res.send({ token });
    });
    // console.log(Date.now());
  } catch {
    (err) => console.log(err);
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {});
