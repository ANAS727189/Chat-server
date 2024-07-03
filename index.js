const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");
require('dotenv').config()

const app = express();
const port = process.env.PORT;
app.use(cors());

const users = {};

app.get("/", (req, res) => {
  res.send("HELLO, I AM ANAS");
});

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("New Connection");

  socket.on("joined", ({ username }) => {
    if (username) {
      users[socket.id] = username;
      console.log(`${username} has joined the chat.`);

     
      socket.emit("welcome", {
        username: "Admin",
        message: `Welcome to the chat, ${username}`,
      });

   
      socket.broadcast.emit("userJoined", {
        username: "Admin",
        message: `${username} has joined the chat`,
      });
    }

    socket.on("message", ({message, id}) => {
        io.emit("sendMessage", {username: users[id], message, id});
    })

  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      socket.broadcast.emit("leave", {
        username: "Admin",
        message: `${users[socket.id]} has left the chat`
     })
      console.log(`${users[socket.id]} has left the chat.`);
      delete users[socket.id];
    }
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
