const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

exports.webApi = functions.https.onRequest(app);
//////////////////////////////////////////////////////////////////

const collection = 'todo';

app.get('/api/getToDoList', (req, res, next) => {
    db.collection('todo').get().then((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({id: doc.id, subject: doc.data().subject});
        });
        res.json({result: data});
    });
});

app.post('/api/addToDo', function (req, res, next) {
    const subject = req.body.subject;
    db.collection('todo').add({
        subject
    })
    .then(function(docRef) {
        res.json({result: docRef.id});
    }) 
    .catch(function(error) {
        res.json({result: null, error: error});
    })
})

app.post('/api/edit', function(req, res, next) {
    const id = req.body.id;
    const subject = req.body.subject;
    db.collection('todo').doc(id).update({subject})
    .then(function() {
        res.json({result: true});
    })
    .catch(function(error) {
        res.json({result: false, error: error});
    })
});

app.post('/api/delete', function(req, res, next) {
    const id = req.body.id;
    db.collection('todo').doc(id).delete().then(function() {
        res.json({result: true});
    })
    .catch(function(error) {
        res.json({error: error, result: false});
    });
});