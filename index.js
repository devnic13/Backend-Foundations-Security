// module imports
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const Sequelize = require('sequelize');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const router = express.Router();
const handlebars = require("express-handlebars").create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// body parser config
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

// connect to db
const sequelize = new Sequelize('database', 'YOUR_NAME', null, {
    host: 'localhost',
    dialect: 'sqlite',
    storage: "./Chinook_Sqlite_AutoIncrementPKs.sqlite"
});

// define schema
const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: Sequelize.STRING,
    passwordHash: Sequelize.STRING,
    salt: Sequelize.STRING
},
{
    freezeTableName: true,
    timestamps: false
})

// auth config
app.use(passport.initialize());

passport.serializeUser(function(user, done){
    done(null, user);
});
  
passport.deserializeUser(function(obj, done){
    done(null, obj);
});

passport.use(new LocalStrategy(function(username, password, done){
    User.findOne({ where: {username: username} }).then(user => {
          
        if(!user){
            return done({success: false, message: 'This is a test.'})
        } else if(crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha1').toString('hex') !== user.passwordHash) {
            return done({success: false, message: 'This is a test.'});
        } else {
            return done(null, user);
        }
    })
}));

// API
app.get('/', (req, res) => {
	res.render('register')
})

app.get('/login', (req, res) => {
	res.render('login')
})

app.post('/login', (req, res) => {
    passport.authenticate('local', function(err, user, info) {
        if(err) {
            console.log(err)
            res.send('this is test')
        } else {
            res.render('home')
        }
    })
})

app.get('/register', (req, res) => {
	res.render('register')
})

app.post('/register', (req, res) => {
    let salt = crypto.randomBytes(16).toString('hex');
    let passwordHash = crypto.pbkdf2Sync(req.body.password, salt, 1000, 64, 'sha1').toString('hex');
    

    User.create({
        username: req.body.username,
        passwordHash: passwordHash,
        salt: salt
    })
    res.render('home')
})



// run server on port 3000
app.listen(3000, () => {
    console.log('server running')
})
