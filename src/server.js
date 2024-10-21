import express from "express";
import SocketIO from "socket.io";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views"); 
app.use("/public",express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

const httpServer = http.createServer(app);//create http server
const wsServer =SocketIO(httpServer);

wsServer.on("connection" , (socket) => {
    socket.on("enter_room", (msg,done) => {
        console.log(msg);
        setTimeout(() => {
            done();
        }, 10000);
    });
});
  
//http server 위에 websocket server 만듦 => 하나만 만들어도 되는데 http도 쓸거면 같이 
//둘 다 만들면 해당 서버는 ws, https 요청 모두 처리 가능 
//const wss = new WebSocket.Server({server});//create websocket server
/*const sockets = [];

wss.on("connection", (socket) =>{
    sockets.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("Connected to Browser");
    socket.on("close", ()=> console.log("Disconnected from the Browser"));
    socket.on("message",(msg) => {
          const message = JSON.parse(msg);
          switch (message.type){
            case "new_message":
                sockets.forEach((aSocket) => 
                    aSocket.send(`${socket.nickname}: ${message.payload}`));
            case "nickname":
                socket["nickname"] = message.payload;
          }
    }); 
});//server.js의 socket은 연결된 브라우저를 뜻함
*/

httpServer.listen(3000, handleListen);  


 