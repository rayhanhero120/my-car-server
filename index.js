const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');


const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crs5f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db('car_sales')
        const productsCollection = database.collection('products')
        const orderCollection = database.collection('myOrders')
        const usersCollection = database.collection('users')
        const reviewsCollection = database.collection('reviews')

        //get products
        //products collections
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const products = await cursor.toArray()
            res.send(products)

        })
        //get single
        app.get('/singleProduct/:id', async (req, res) => {
            const result = await productsCollection.find({ _id: ObjectId(req.params.id) }).toArray()
            res.send(result[0])
        })
        //orders collections

        app.post('/order', async (req, res) => {
            const result = await orderCollection.insertOne(req.body)
            res.send(result)
        })

        app.get('/myOrders/:email', async (req, res) => {
            const result = await orderCollection.find({ email: req.params.email }).toArray()
            res.send(result)

        })

        app.delete('/deleteMyOrder/:id', async (req, res) => {
            const result = await orderCollection.deleteOne({ _id: ObjectId(req.params.id), })
            res.send(result)

        })
        //users collections
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })

        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })

        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        //reviews collections
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray()
            res.send(reviews)

        })

        app.post('/reviews', async (req, res) => {
            const result = await reviewsCollection.insertOne(req.body)
            res.send(result)
        })


    }
    finally {
        // await client.close()

    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(` listening at${port}`)
})