const express = require("express");
const app = express();
const path = require("path");
const nunjucks = require("nunjucks");
const mongoose = require('mongoose');
const server = require("http").Server(app);
const io = require("socket.io")(server, { serveClient: true });
const passport = require('passport');
const {Strategy,ExtractJwt} = require('passport-jwt');

const opst = {
jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
secretOrKey :'secret'};

passport.use(new Strategy(opst,(jwt_payload,done)=>{
    if(jwt_payload != null) return done(false,jwt_payload);
    done();
}));


mongoose.connect('mongodb://127.0.0.1:27017/chats',{useNewUrlParser:true})

nunjucks.configure("./client/views", {
  autoescape: true,
  express: app,
});

const PORT = process.env.PORT || 3000;
app.use("/assets", express.static(path.join(__dirname, "..", "client/public")));
function checkAuth(req,res,next){
    passport.authenticate('jwt',{session:false},(err,decryptToken,jwtError)=>{
        if(jwtError != null || err !=null) return res.render("index.html", { error: err || jwtError})
        req.user = decryptToken;
        next();
    })(req,res,next)
}
app.get("/",checkAuth, (req, res) => {res.render("index.html", { date: new Date() })});

require('./sockets')(io);

server.listen(PORT, () => {
  console.log(`Server start on: ${PORT}`);
});
