
const socket = io();
 

 let myStream;
 let myPeerConnection;
 let dataChannel;
 let roomName = "1234";
 let intervalId = null;


 async function initCall() {
   makeConnection();
 }

 document.addEventListener("DOMContentLoaded", function() {
   const canvas = document.getElementById("canvas");
   myStream = canvas.captureStream(30); // 30fps로 캡처하여 MediaStream 생성
   // 웹 페이지가 로드되었을 때 실행할 함수
   initCall();
   socket.emit("join_room", roomName);
});

 socket.on("welcome",async () => {
  initCall();
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
   console.log('Configuration:', myPeerConnection.getConfiguration());
   myPeerConnection.addEventListener("icecandidate", handleIce);

   dataChannel = myPeerConnection.createDataChannel("myDataChannel");
   dataChannel.addEventListener("open", handleData);
   dataChannel.addEventListener("close", () => { 
    console.log("Peer Closed");
    if(intervalId){
      clearInterval(intervalId);
      intervalId = null;
    }
    console.log('Configuration:', myPeerConnection.getConfiguration());
   });
   myStream
      .getTracks()
      .forEach(track => myPeerConnection.addTrack(track, myStream));
   
 }
function handleData(){
   intervalId = setInterval(() => {
      dataChannel.send(predictToSend);
  }, 1000); // 1초마다 전송
 }

 function handleIce(data){
   socket.emit("ice", data.candidate, roomName);
   console.log("My iceCandidate"); 
   console.log(data);
 }



//model.


const URL = "http://localhost:3000/public/model/";
let model, webcam, ctx, labelContainer, maxPredictions;

let frameCount = 0;
let lastPredictions = [];
let lastPose;
let predictToSend;
const PREDICTION_INTERVAL = 9; // 10프레임마다 예측
const SMOOTHING_WINDOW = 3; // 최근 5개의 예측을 평균화
const UPDATE_THRESHOLD = 0.05; // 10% 이상 변화가 있을 때만 업데이트

document.addEventListener("DOMContentLoaded", init);

      async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // Load the model and metadata
        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Setup webcam with reduced resolution
        const size = 400; // 해상도를 낮추어 프레임 속도 개선
        const flip = true;
        webcam = new tmPose.Webcam(size, size, flip);
        await webcam.setup(); // 웹캠 접근 요청
        await webcam.play();

        // Initialize canvas and context
        const canvas = document.getElementById("canvas");
        canvas.width = size;
        canvas.height = size;
        ctx = canvas.getContext("2d");

        // Initialize label container
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
          labelContainer.appendChild(document.createElement("div"));
        }

        // Start the loop
        window.requestAnimationFrame(loop);
      }


 async function loop() {
   webcam.update(); // 웹캠 프레임 업데이트
   frameCount++;

   if (frameCount % PREDICTION_INTERVAL === 0) {
     await predict();
   }

   drawPose(lastPose);
   window.requestAnimationFrame(loop);
 }

 async function predict() {
   const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
   const prediction = await model.predict(posenetOutput);
  
   lastPose = pose;
   lastPredictions.push(prediction);
   if (lastPredictions.length > SMOOTHING_WINDOW) {
     lastPredictions.shift();
   }

   const smoothedPrediction = smoothPredictions(lastPredictions);
   updateLabelContainer(smoothedPrediction);
 }

 function smoothPredictions(predictions) {
   return predictions[0].map((_, classIndex) => {
     const sum = predictions.reduce((acc, pred) => acc + pred[classIndex].probability, 0);
     return {
       className: predictions[0][classIndex].className,
       probability: sum / predictions.length
     };
   });
 }

 function updateLabelContainer(smoothedPrediction) {
   for (let i = 0; i < maxPredictions; i++) {
     const classPrediction =
       smoothedPrediction[i].className + ": " + (smoothedPrediction[i].probability*100).toFixed(2);
       if(i == 0){
         predictToSend = (smoothedPrediction[i].probability*100).toFixed(2);
       }
     const currentValue = labelContainer.childNodes[i].innerHTML;
     const currentProbability = parseFloat(currentValue.split(": ")[1] || "0");
    
     if (Math.abs(smoothedPrediction[i].probability - currentProbability) > UPDATE_THRESHOLD) {
       labelContainer.childNodes[i].innerHTML = classPrediction;
     }
   }
 }

 function drawPose(pose) {
   if (webcam.canvas) {
     ctx.drawImage(webcam.canvas, 0, 0);
     if (pose) {
       const minPartConfidence = 0.5;
       tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
       tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
     }
   }
 }
