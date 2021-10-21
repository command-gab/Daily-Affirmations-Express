const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

let db, collection;

const url = "mongodb+srv://commandgab:Testing4@cluster0.cev5m.mongodb.net/commandgab?retryWrites=true&w=majority";
const dbName = "commandgab";

app.listen(4000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})

app.post('/messages', (req, res) => {
  // form (method: post),
  db.collection('messages').insertOne({msg: req.body.msg, heart: 0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.get('/search', (req, res) => {
  console.log(req.query.search)
  db.collection('messages').find({"msg": {$regex : req.query.search,$options:'i'}}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})

// fetch through main.js, $set is the update
app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({msg: req.body.msg}, {
    $inc: {
      heart:1,
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

// app.delete('/messages', (req, res) => {
//   db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
//     if (err) return res.send(500, err)
//     res.send('Message deleted!')
//   })
// })