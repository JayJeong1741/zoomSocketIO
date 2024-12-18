import express from "express";
import SocketIO from "socket.io";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views"); 
app.use("/public",express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("chat"));
app.get("/*", (req,res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

const httpServer = http.createServer(app);//create http server
const wsServer = SocketIO(httpServer);

 wsServer.on("connection", socket => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
        console.log(offer);
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
        console.log(answer);
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
        console.log(`ice : ${ice}`);
    });
    socket.on("success", msg => {
        console.log(msg);
    })
    
 });

httpServer.listen(3000, handleListen);  
