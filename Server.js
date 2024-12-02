const express = require("express");
const http = require('http');
const cors = require("cors");
const morgan = require("morgan");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("short"));

// Serve static files from the 'public' directory
app.use('/images', express.static(path.join(__dirname, "../backend/appbackend-end/Images/English.png")));

// Custom middleware to check if an image exists
app.get('/images/:imageName', (req, res, next) => {
    const imagePath = path.join(__dirname, '"../appbackend-end/Images/English.png"', req.params.imageName);
    
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send({ error: 'Image not found' });
        }
        res.sendFile(imagePath);
    });
});

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

// Remaining routes...

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