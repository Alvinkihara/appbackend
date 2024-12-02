const express = require("express");
const http = require('http');
const cors = require("cors");
const morgan = require("morgan");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());
app.use(cors());

// Database configuration
const uri = "mongodb+srv://ak2237:Mongodb@webstore.oq4ce.mongodb.net"; // Your MongoDB connection string
const dbName = "Webstore"; // Replace with your actual database name

const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db;

const port = process.env.PORT || 3000; // Use Render's port or default to 3000
client.connect()
    .then(() => {
        db = client.db(dbName);
        console.log("Connected to MongoDB");

        // Start the server
        http.createServer(app).listen(port, function() {
            console.log(`App started on port ${port}`);
        });
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB", err);
    });

// Static file serving and logging
app.use(morgan("short"));


// Route to get all lessons
app.get('/lessons', async (req, res, next) => {
    try {
        const collection = db.collection('lessons'); //  actual collection name
        const lessons = await collection.find({}).toArray();
        res.json(lessons);
    } catch (err) {
        next(err);
    }
});

// Route to get all documents from a collection
app.get('/collection/:collectionName', async (req, res, next) => {
    const { collectionName } = req.params;
    try {
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        res.json(documents);
    } catch (err) {
        next(err);
    }
});

// Route to get a specific document by ID from a collection
app.get('/collection/:collectionName/:id', async (req, res, next) => {
    const { collectionName, id } = req.params;

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
    }

    try {
        const collection = db.collection(collectionName);
        const document = await collection.findOne({ _id: new ObjectId(id) });

        if (!document) {
            return res.status(404).send({ error: 'Document not found' });
        }

        res.json(document);
    } catch (err) {
        next(err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'An internal server error occurred' });
});

// Route to add a new lesson
app.post('/collection/:collectionName', async (req, res, next) => {
    const { collectionName } = req.params;
    const newDocument = req.body;

    try {
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(newDocument);
        res.status(201).send({ message: 'Document created successfully', documentId: result.insertedId });
    } catch (err) {
        next(err);
    }
});

// Route to save a new order postman
app.post('/orders', async (req, res, next) => {
    const orderData = req.body;

    try {
        const collection = db.collection('orders'); // Assuming you have an 'orders' collection
        const result = await collection.insertOne(orderData);
        res.status(201).send({ message: 'Order created successfully', orderId: result.insertedId });
    } catch (err) {
        console.error("Error inserting order:", err); // Log the error
        res.status(500).send({ error: 'An error occurred while saving the order' });
    }
});
// Route to save a new order
// app.post('/orders', async (req, res, next) => {
//     const orderData = req.body;

//     try {
//         const collection = db.collection('orders'); // Assuming you have an 'orders' collection
//         const result = await collection.insertOne(orderData);
//         res.status(201).send({ message: 'Order created successfully', orderId: result.insertedId });
//     } catch (err) {
//         console.error("Error inserting order:", err); // Log the error
//         next(err);
//     }
// });

app.put('/collection/:collectionName/:id', async (req, res, next) => {
    const { collectionName, id } = req.params;
    const updatedDocument = req.body;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
    }

    try {
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedDocument }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Document not found' });
        }
        res.send({ message: 'Document updated successfully' });
    } catch (err) {
        next(err);
    }
});

// Route to delete a specific document by ID from a collection
app.delete('/collection/:collectionName/:id', async (req, res, next) => {
    const { collectionName, id } = req.params;

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
    }

    try {
        const collection = db.collection(collectionName);
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ error: 'Document not found or already deleted' });
        }

        res.status(200).send({ message: 'Document deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Handle missing routes
app.use(function(req, res) {
    res.status(404).json({ message: "Operation not available" });
});