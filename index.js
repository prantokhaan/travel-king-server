const express = require("express");

const cors = require("cors");
require("dotenv").config();

const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

// MiddleWare 
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}))

// mongodb 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jry2k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run(){
    try{
        await client.connect();
        const database = client.db("travelSpots");
        const placesCollection = database.collection("places");
        const bookingCollection = database.collection("booking");
        const galleryCollection = database.collection("gallery");

        // Get Place Data 
        app.get('/places', async (req, res) => {
            const cursor = placesCollection.find({});
            const places = await cursor.toArray();
            res.send(places);
        });

        app.get('/place/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const place = await placesCollection.findOne(query);
            res.send(place);
        })

        // Get Gallery Data 
        app.get('/photos', async (req, res) => {
            const cursor = galleryCollection.find({});
            const photos = await cursor.toArray();
            res.send(photos);
        });

        // Post Api 
        app.post('/addPlace', async (req, res) => {
            const newSpot = req.body;
            const result = await placesCollection.insertOne(newSpot);
            res.json(result)
        })

        // Book Order 
        app.post('/bookedPlace', async(req, res) => {
            const booked = req.body;
            const result = await bookingCollection.insertOne(booked);
            res.json(result);
        })

        // Get My Bookings
        app.get("/myBookings/:email", async (req, res) => {
          const result = await bookingCollection.find({ email: req.params.email }).toArray();
          res.send(result);
        });

        // Get All Bookings
        app.get('/allBookings', async (req, res) => {
            const cursor = bookingCollection.find({});
            const allBookings = await cursor.toArray();
            res.send(allBookings);
        });

        // Delete Plan 
        app.delete('/cancelBooking/:id', async (req, res) => {
            const result = await bookingCollection.deleteOne({_id: req.params.id});
            res.json(result);
            console.log(result)
        })
        //Update Status
        app.put("/updateStatus/:id", async (req, res) => {
          const id = req.params.id;
          const newStatus = req.body;
          const filter = {_id: id};
          const options = {upsert: true};
          const updateStatus = {
              $set: {
                  status: newStatus[0]
              }
            }
          const result = await bookingCollection.updateOne(filter, updateStatus, options);
          res.json(result)
        });

    }finally{
        // await client.close()
    }
}
run().catch(console.dir)



app.get("/", (req, res) => {
  res.send("travel king server is running");
});

app.listen(port, () => {
  console.log("running the server from", port);
});
