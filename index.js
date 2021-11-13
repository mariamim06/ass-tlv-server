const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qqcyy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        // console.log('connected to database');
        const database = client.db('nicheProductWebsite');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');

        // GET API
        app.get('/products', async(req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/reviews', async(req, res) => {
            const cursor1 = reviewsCollection.find({});
            const reviews = await cursor1.toArray();
            
            console.log('hit the posrt api')
            res.send(reviews);
        });

        // app.get('/orders', async(req, res) => {
        //     const email = req.query.email;
        //     const query = {email: email}
        //     console.log(query);
        //     const cursor1 = ordersCollection.find(query);
        //     const orders = await cursor1.toArray();
        //     res.json(orders);
        // })

        app.get('/orders', async(req, res) => {
           
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            
            res.json(orders);
        })

        app.get('/userOrders', async(req, res) => {
            const email = req.query.email;
                const query = {email: email}
                console.log(query);
                const cursor = ordersCollection.find(query);
                const userOrders = await cursor.toArray();
                res.json(userOrders);
        })
       



    //Get Single Service
        app.get('/products/:id', async(req, res) => {
            const id = req.params.id;
            console.log('getting specific product', id);
            const query = {_id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        app.get('/reviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id) };
            const review = await reviewsCollection.findOne(query);
            res.json(review);
        });
        app.get('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);
            res.json(order);
        });



        //POST API
//POST PRODUCTS API
        app.post('/products', async(req, res) => {
            const product = req.body;
            console.log('hit api', product);
           
            const result  = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });
// POST REVIEWS API
        app.post('/reviews', async(req, res) => {
            const review = req.body;
            console.log('hit api', review);
           
            const result  = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });


        
//specification of admin
app.get('/users/:email', async(req, res) => {
    const email = req.params.email;
    const query = {email: email};
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user.role === 'admin') {
        isAdmin= true;
    }
    res.json({admin: isAdmin});
});


//POST USERS API
        app.post('/users', async(req, res) => {
             const user = req.body;
             const result = await usersCollection.insertOne(user);
             res.json(result);
        })

//POST ORDER API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result)
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const options = { upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async(req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        app.put('/orders/:id', async(req, res) =>{
            const id = req.params.id;
            // console.log('put', order);
            const filter = {_id: ObjectId(id)};
            const updateDoc = {$set: {status: 'shipped'}};
            const result = await ordersCollection.updateOne(filter, updateDoc)
            res.json(result);
        })

        

        //DELETE API
        app.delete('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        app.delete('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Runninng niche product server!');
});

app.listen(port, () => {
    console.log(`Running niche product server at ${port}`);
})