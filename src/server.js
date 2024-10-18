import express from "express";
import WebSocket from "ws";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views"); 
app.use("/public",express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);//create http server

const wss = new WebSocket.Server({server});//create websocket server  
//http server 위에 websocket server 만듦 => 하나만 만들어도 되는데 http도 쓸거면 같이 
//둘 다 만들면 해당 서버는 ws, https 요청 모두 처리 가능 



wss.on("connection", (socket) =>{
    console.log("Connected to Browser");
    socket.send("hello!");//.send는 socket에서 지원하는 func 
    socket.on("close", ()=> console.log("Disconnected from the Browser"));
    socket.on("message",(message) => {
        console.log(message.toString('utf8'));
    }); 
});//server.js의 socket은 연결된 브라우저를 뜻함

server.listen(3000, handleListen); 


