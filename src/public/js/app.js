const socket = new WebSocket("ws://localhost:3000"); //여기서 socket은 서버로의 연결을 뜻함 

socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
    console.log("New Message : ", message.data);  
});
socket.addEventListener("close", () => {
    console.log("Close Connection to Server");
});

setTimeout(() => {
    socket.send("Hello from the Server");
},10000); 