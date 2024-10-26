import express from "express";
import SocketIO from "socket.io";
import https from "https";
import fs from "fs";

// Express 앱 설정
const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// HTTPS 서버 옵션 설정
const options = {
  key: fs.readFileSync(__dirname +"/private.key"),
  cert: fs.readFileSync(__dirname +"/certificate.crt"),
};

// HTTPS 서버와 Socket.IO 서버 생성
const httpsServer = https.createServer(options, app);
const wsServer = SocketIO(httpsServer);

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

// 서버 포트 설정 및 실행
const handleListen = () => console.log("Listening on https://localhost:3000");
httpsServer.listen(3000, handleListen);