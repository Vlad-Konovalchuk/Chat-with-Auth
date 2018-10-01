const express = require("express");
const app = express();
const path = require("path");
const nunjucks = require("nunjucks");
const mongoose = require('mongoose');
const server = require("http").Server(app);
const io = require("socket.io")(server, { serveClient: true });
const passport = require('passport');
const {Strategy} = require('passport-jwt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const {jwt} = require('./config')

passport.use(new Strategy(jwt,(jwt_payload,done)=>{
    if(jwt_payload != null) return done(false,jwt_payload);
    done();
}));


mongoose.connect('mongodb://127.0.0.1:27017/chats',{useNewUrlParser:true})
mongoose.set('debug',true)
nunjucks.configure("./client/views", {
  autoescape: true,
  express: app,
});

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());
require('./router')(app);
require('./sockets')(io);

server.listen(PORT, () => {
  console.log(`Server start on: ${PORT}`);
});
