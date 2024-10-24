const socket = io();

 const welcome = document.getElementById("welcome");
 const roomForm = welcome.querySelector("#roomName");
 const nameForm = welcome.querySelector("#name")
 const room = document.getElementById("room");

 room.hidden = true; 

 let roomName;

 function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
 }

 function handleMessageSubmit(event){
     event.preventDefault();
     const input = room.querySelector("#message input"); 
     const value = input.value;
     socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
     });
     input.value = "";
 }

 function handleNicknameSubmit(event){
   event.preventDefault();
   const input = nameForm.querySelector("input"); 
   socket.emit("nickname", input.value);
 }


function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#message");
    msgForm.addEventListener("submit", handleMessageSubmit);  
}


function handleRoomSubmit(event){
    event.preventDefault(); 
    const roomInput = roomForm.querySelector("input");
    socket.emit("enter_room", roomInput.value, showRoom);
    roomName = roomInput.value;
}

 roomForm.addEventListener("submit", handleRoomSubmit);   
 nameForm.addEventListener("submit", handleNicknameSubmit);


 socket.on("welcome", (user) => {
    addMessage(`${user} Joined!`);
 });
 socket.on("Bye", (user) => {
    addMessage(`${user} left!`);
 });
 socket.on("new_message", (msg) => {
    addMessage(msg);
 });