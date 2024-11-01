
const socket = io();


 
 

 let myStream;
 let myPeerConnection
 let roomName = "1234";


 async function initCall() {
   makeConnection();
 }

 document.addEventListener("DOMContentLoaded", function() {
   const canvas = document.getElementById("canvas");
   myStream = canvas.captureStream(60); // 30fps로 캡처하여 MediaStream 생성
   // 웹 페이지가 로드되었을 때 실행할 함수
   initCall();
   socket.emit("join_room", roomName);
});

 socket.on("welcome",async () => {
   console.log("welcome");
   const offer = await myPeerConnection.createOffer();
   myPeerConnection.setLocalDescription(offer);
   console.log(`My Offer : ${offer}`);
   socket.emit("offer", offer, roomName);
 });

 socket.on("offer", async(offer) => {
   myPeerConnection.setRemoteDescription(offer);
   const answer = await myPeerConnection.createAnswer();
   myPeerConnection.setLocalDescription(answer);
   console.log(`My answer : ${answer}`);
   socket.emit("answer", answer, roomName);
 });

 socket.on("answer", (answer) => {
   console.log(`Answer : ${answer}`);
   myPeerConnection.setRemoteDescription(answer);
 });

 socket.on("ice", ice => {
   myPeerConnection.addIceCandidate(ice);
   const iceOth = JSON.stringify(ice);
   console.log(`ice from other : ${iceOth}`);
 });


 //RTC Code

 function makeConnection(){
   myPeerConnection = new RTCPeerConnection();
   myPeerConnection.addEventListener("icecandidate", handleIce);
   myPeerConnection.addEventListener("track", handleAddStream);
   myStream
      .getTracks()
      .forEach(track => myPeerConnection.addTrack(track, myStream));
 }

 function handleIce(data){
   socket.emit("ice", data.candidate, roomName);
   console.log("My iceCandidate"); 
   console.log(data);
 }
 function handleAddStream(data){
   const video = data.streams[0];
 }