const output = document.getElementById("output");

// Device Info
document.getElementById("deviceInfoBtn").addEventListener("click", async () => {
  const info = await window.agent.getDeviceInfo();
  output.innerText = JSON.stringify(info, null, 2);
});

// Location Save
document.getElementById("locationBtn").addEventListener("click", async () => {
  const fakeLoc = { lat: 12.9716, lon: 77.5946 }; // demo coords
  const res = await window.agent.saveLocation(fakeLoc);
  output.innerText = "📍 Location saved to " + res.file;
});

// Audio Recording
let mediaRecorder, audioChunks = [];
document.getElementById("recordAudioBtn").addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
      audioChunks = [];
    };
    mediaRecorder.start();
    output.innerText = "🎤 Recording audio...";
  } else {
    mediaRecorder.stop();
    output.innerText = "✅ Audio recording stopped & saved.";
  }
});

// Webcam Capture
const video = document.getElementById("liveVideo");
const canvas = document.getElementById("photoCanvas");
document.getElementById("webcamBtn").addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  setTimeout(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "snapshot.png";
      a.click();
    });
    output.innerText = "📸 Snapshot captured & saved.";
  }, 3000);
});

// File Delete
document.getElementById("deleteBtn").addEventListener("click", async () => {
  const result = await window.agent.deleteFile();
  output.innerText = result.message;
});
