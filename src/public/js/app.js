
const socket = io();

 const myFace = document.getElementById("myFace");
 const muteBtn = document.getElementById("mute");
 const cameraBtn = document.getElementById("camera");
 const camerasSelect = document.getElementById("cameras"); 

 const welcome = document.getElementById("welcome");
 const call = document.getElementById("call");

 call.hidden = true;

 let myStream;
 let muted = false;
 let cameraOff = false;
 let roomName; 
 let myPeerConnection

 async function getCameras(){
   try{
      const devices = navigator.mediaDevices.enumerateDevices();
      const cameras = (await devices).filter((device) => device.kind === "videoinput");
      const currentCamera = myStream.getVideoTracks()[0] ;
      cameras.forEach((camera) => {
         const option = document.createElement("option");
         option.value = camera.deviceId;
         option.innerText = camera.label;
         if(currentCamera.label === camera.label){
            option.selected = true;
         }
         camerasSelect.appendChild(option); 
      });

       
   }catch(e){
      console.log(e);
   }
}

 async function getMedia(deviceId) {
   const initialConstraints = {
       audio:true, 
       video: {facingMode:"user"},
   }; 
   const cameraConstraints = {
      audio: true,
      video: {deviceId: {exact: deviceId }},
   }
   try{
      myStream = await navigator.mediaDevices.getUserMedia( 
          deviceId? cameraConstraints : initialConstraints
      );
      myFace.srcObject = myStream;
      if(!deviceId){
         await getCameras();
      }

   }catch(e){
      console.log(e);
   }
 }
 

 function handleMuteClick(){
   myStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));

   if(!muted){
      muteBtn.innerText = "UnMute";
      muted = true;
   }else{
      muteBtn.innerText = "Mute";
      muted = false;
   }
 }
 function handleCameraClick(){
   myStream
      .getVideoTracks()
      .forEach((track) =>(track.enabled = !track.enabled));
   if(cameraOff){
      cameraBtn.innerText = "Turn Camera Off ";
      cameraOff = false;
   }else{
      cameraBtn.innerText = "Turn Camera On";
      cameraOff = true;
   }
 }

 async function handleCameraChange(){
   await  getMedia(camerasSelect.value);

   if(myPeerConnection){
      const videoTrack = myStream.getVideoTracks()[0];
      const videoSender = myPeerConnection
         .getSenders()
         .find((sender) => sender.track.kind === "video");
      videoSender.replaceTrack(videoTrack);
   }
 }

 muteBtn.addEventListener("click", handleMuteClick);
 cameraBtn.addEventListener("click", handleCameraClick );
 camerasSelect.addEventListener("input", handleCameraChange);

 //Welcom Form 

 const welcomForm = welcome.querySelector("form");

 async function initCall() {
   welcome.hidden = true;
   call.hidden = false;
   await getMedia(); 
   makeConnection();
 }

async function handleWelcomSubmit(evnet){
   evnet.preventDefault();
   const input = welcomForm.querySelector("input");
   await initCall();
   socket.emit("join_room", input.value);
   roomName = input.value;
   input.value="";
}

 welcomForm.addEventListener("submit", handleWelcomSubmit);

 socket.on("welcome",async () => {
   const offer = await myPeerConnection.createOffer();
   myPeerConnection.setLocalDescription(offer);
   socket.emit("offer", offer, roomName);
 });

 socket.on("offer", async(offer) => {
   myPeerConnection.setRemoteDescription(offer);
   const answer = await myPeerConnection.createAnswer();
   myPeerConnection.setLocalDescription(answer);
   socket.emit("answer", answer, roomName);
 });

 socket.on("answer", (answer) => {
   myPeerConnection.setRemoteDescription(answer);
 });

 socket.on("ice", ice => {
   myPeerConnection.addIceCandidate(ice);
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
   console.log(data);
 }

 function handleAddStream(data){
   const peerFace = document.getElementById("peerFace");
   peerFace.srcObject = data.streams[0];
 }