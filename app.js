const path = require('path');
const express = require('express');
const session = require('express-session');
const sessionStore = require('sessionstore').createSessionStore();
const bodyParser  = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const morgan = require('morgan');
const http = require('http').Server(app);

const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');

app.use(morgan('dev'));
app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true, store: sessionStore}))
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


  io.use(passportSocketIo.authorize({
    cookieParser : cookieParser,
    key : 'express.sid',
    secret: 'keyboard cat',
    store: sessionStore,
    fail: function(data, message, error, accept) {
            console.log('failed connection to socket.io')
            accept(null, false);
          },
  success: function(data, accept) {
            console.log('socket.io connected successfully')
            accept(null, true);
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
  io.on('connection', function(socket){
    socket.emit('news', { hello : 'world'})
  })
  // console.log(req.sessionID);
  // console.log(passport.session);
  // console.log(app.sess);
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

// var httpServer = http.createServer(app);
// httpServer.listen(8000);

// app.listen(8000, function(){
//   console.log('sever running')
// })
http.listen(8000, function (){

})
