const output = document.getElementById("output");

// Device Info
document.getElementById("deviceInfoBtn").addEventListener("click", async () => {
  const info = await window.agent.getDeviceInfo();
  output.innerText = JSON.stringify(info, null, 2);
});

// Location Save
document.getElementById("locationBtn").addEventListener("click", async () => {
  const fakeLoc = { lat: 12.9716, lon: 77.5946 };
  const res = await window.agent.saveLocation(fakeLoc);
  output.innerText = "📍 Location saved to " + res.file;
});

// Audio Recording (MP4)
let mediaRecorder, audioChunks = [];
document.getElementById("recordAudioBtn").addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.mp4";
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

// Screenshot (HQ)
document.getElementById("screenshotBtn").addEventListener("click", async () => {
  const dataUrl = await window.agent.takeScreenshot();
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "screenshot.png";
  a.click();
  output.innerText = "📸 High-quality screenshot saved!";
});

// Screen Recording
let screenRecorder, screenChunks = [];
document.getElementById("screenRecordBtn").addEventListener("click", async () => {
  if (!screenRecorder || screenRecorder.state === "inactive") {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      screenRecorder.ondataavailable = e => screenChunks.push(e.data);
      screenRecorder.onstop = () => {
        const blob = new Blob(screenChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "screen-recording.mp4";
        a.click();
        screenChunks = [];
      };
      screenRecorder.start();
      output.innerText = "🎥 Screen recording started...";
    } catch (err) {
      output.innerText = "❌ Screen recording failed: " + err.message;
    }
  } else {
    screenRecorder.stop();
    output.innerText = "✅ Screen recording stopped & saved.";
  }
});

// File Delete
document.getElementById("deleteBtn").addEventListener("click", async () => {
  const result = await window.agent.deleteFile();
  output.innerText = result.message;
});
