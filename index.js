const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jodl5p0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();

    const toyCollection = client.db("allToysDb").collection("allToysInfo");
    //read
    app.get("/all-toys", async (req, res) => {
      const { sortBy, sortOrder } = req.query;
    
      // Define the sort options based on the sortBy and sortOrder parameters
      let sortOptions = {};
      if (sortBy === "price") {
        sortOptions = { price: sortOrder === "desc" ? -1 : 1 }; // Sort by price in the specified order
      } else if (sortBy === "sellerEmail") {
        sortOptions = { sellerEmail: sortOrder === "desc" ? -1 : 1 }; // Sort by sellerEmail in the specified order
      }
    
      const cursor = toyCollection.find().sort(sortOptions);
      const result = await cursor.toArray();
      res.send(result);
    });
    
    //common api to get all toys by id
    app.get("/all-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });
    //read by subcategory
    app.get("/toys-by-subcategory", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // api to get all toys info by subcategory
    app.get("/toys-by-subcategory/:subCategory", async (req, res) => {
      const subCategory = req.params.subCategory;
      const query = { subCategory: subCategory };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });
    //update
    app.patch("/all-toys/:id", async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      console.log(id, toy);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = {
        $set: {
          price: toy.price,
          availableQuantity: toy.availableQuantity,
          description: toy.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updatedToy, options);
      res.send(result);
    });
    //create
    app.post("/add-toy", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    //delete
    app.delete("/all-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//test
app.get("/", (req, res) => {
  res.send("The Puzzled Mind Server is running...");
});

app.listen(port, () => {
  console.log(`The Puzzled Mind Server is running on port ${port}`);
});
