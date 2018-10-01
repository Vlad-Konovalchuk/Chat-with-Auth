const express = require("express");
const app = express();
const path = require("path");
const nunjucks = require("nunjucks");
const mongoose = require('mongoose');
const server = require("http").Server(app);
const io = require("socket.io")(server, { serveClient: true });

mongoose.connect('mongodb://127.0.0.1:27017/chats',{useNewUrlParser:true})

nunjucks.configure("./client/views", {
  autoescape: true,
  express: app,
});

const PORT = process.env.PORT || 3000;
app.use("/assets", express.static(path.join(__dirname, "..", "client/public")));

app.get("/", (req, res) => [res.render("index.html", { date: new Date() })]);
io.on("connection", (socket) => {
  socket.emit("connected", "You`re connected");
  //   const address = socket.request.connection.remoteAddress;
  //   console.log(address);

  socket.join("all");
  socket.on("msg", (content) => {
    const obj = {
      date: new Date(),
      content: content,
      username: "Test",
    };
    socket.emit("message", obj);
    socket.to('all').emit("message",obj)
  });
});
server.listen(PORT, () => {
  console.log(`Server start on: ${PORT}`);
});
