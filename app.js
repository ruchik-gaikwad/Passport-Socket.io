const express = require('express');
const session = require('express-session');
const bodyParser  = require('body-parser');
const app = express();
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const morgan = require('morgan');


app.use(morgan('dev'));
app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(passport.session());


const Users = [];

passport.use(new LocalStrategy(
  function(username, password, done) {
    let authenticate;
    Users.map(function (value) {
    if (value.username === username && value.password === password){
         authenticate = value
       }
    });
    if(!authenticate){
      return done(null, false)
    }
    if (authenticate){
      return done(null, authenticate);
    }
  }));

passport.serializeUser(function(user, done) {
    // console.log(user)
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    // console.log(user)
    done(null, user)
});


function isLoggedin (req, res, next){

  if (req.isAuthenticated()){
    // console.log(req.isAuthenticated());
    next()
  }else{
    // console.log(req.isAuthenticated());
    res.sendStatus(401)
  }
}


app.post('/login', passport.authenticate('local'), function(req, res){
  // console.log('login');
  // console.log(req.user);
  console.log(req.session);
  console.log(typeof passport.session);
  // console.log(req.user)
  res.json(req.user)
})

app.post ('/register', function(req, res){
  Users.map(function (value) {
    if (value.username === req.body.username){
      res.json({message: 'user already exist'})
      return null;
    }
  })
  let user = {
    username : req.body.username,
    password : req.body.password
  }
  Users.push(user);
  res.json(Users)
})

app.get('/logout', function(req, res){
  req.logout();
  res.sendStatus(200);
})


app.post('/book', isLoggedin,function (req, res) {
  // console.log('secquried route');
  res.json({"message": "secure route"})
})

app.listen(8000, function(){
  console.log('sever running')
})
