const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'test',
        database: 'smart-brain'
    }
});

// app.get('/', (req, res) => {
//     res.json(database.users);
// })

app.post('/signin', (req, res) => {
    db.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data=>{
        const isValid=bcrypt.compareSync(req.body.password, data[0].hash);
        if(isValid){
            return db.select('*').from('users')
            .where('email','=',req.body.email)
            .then(user=>res.json(user[0]))
            .catch(err=>res.status(404).json('cant find user...'))
        }else{
            res.status(404).json('wrong credentials...')
        }
    })
    .catch(err=>res.status(404).json('wrong credentials...'))
})

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, saltRounds);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        name: name,
                        email: loginEmail[0],
                        joined: new Date()
                    })
                    .then(user => res.json(user[0]))
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json(err));
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db('users').select('*').where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('not found')
            }
        }).catch(err => res.status(400).json('Error getting users: ', err))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id).increment('entries', 1)
        .returning('entries')
        .then(entries => res.json(entries[0]))
        .catch(err => res.status(400).json('cant get entries...'))
})

app.listen(3000, () => {
    console.log('server is running on port 3000');
})

/*

/ -> this is working...
/signin -> POST = succes/fail
/register -> POST = user
/profile/:userID -> GET = user
/image -> PUT = user

*/