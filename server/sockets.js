// const io = require("socket.io")(server, { serveClient: true });
const MessageModel = require("./models/chatModel");
module.exports = (io) => {
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
      MessageModel.create(obj, (err) => {
        if (err) return console.log("MessageModel", err);
        socket.emit("message", obj);
        socket.to("all").emit("message", obj);
      });
    });
    socket.on("receiveHistory", () => {
      MessageModel.find({})
        .sort({ date: -1 })
        .limit(50)
        .sort({ date: -1 })
        .lean()
        .exec((err, messages) => { 
          if (!err) return console.log("MessageModel", err);
          socket.emit("history", messages);
        //   socket.to("all").emit("history", messages);
        });
    });
  });
};
