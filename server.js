const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

const register = require('./controllers/register');
const signIn = require('./controllers/signIn');
const profile=require('./controllers/profile');
const image=require('./controllers/image');

app.use(cors());
app.use(bodyParser.json());

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl:true
    }
});

app.get('/', (req, res) => {
    res.json('it is working!!!');
})

app.post('/signin', (req, res) => signIn.handleSignIn(req,res,db,bcrypt));
app.post('/register', (req,res)=> register.handleRegister(req,res,db,bcrypt,saltRounds));
app.get('/profile/:id', (req, res) => profile.handleProfile(req,res,db));
app.put('/image', (req, res) => image.handleImage(req,res,db));
app.post('/imageurl', (req, res) => image.handleImageApi(req,res));

app.listen(process.env.PORT || 3000, () => {
    console.log(`server is running on port ${process.env.PORT}`);
})

/*

/ -> this is working...
/signin -> POST = succes/fail
/register -> POST = user
/profile/:userID -> GET = user
/image -> PUT = user

*/