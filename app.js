import {
  FilesetResolver,
  HandLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const video = document.querySelector("#video");
const canvas = document.querySelector("#overlay");
const ctx = canvas.getContext("2d");

const startButton = document.querySelector("#start");
const statusText = document.querySelector("#status");
const message = document.querySelector("#message");
const detail = document.querySelector("#detail");

let tracker;
let stream;
let running = false;
let lastVideoTime = -1;
let lastDetect = 0;
let lastGesture = "";
let gestureFrames = 0;
let shownGesture = "";
let lastChange = 0;

const responses = {
  thumbs: ["👍 Mantap!", "Akhirnya ada juga jempolnya."],
  peace: ["✌️ Santai dulu.", "Dunia belum kiamat, cuy."],
  fist: ["✊ Gas terus!", "Semangat eksperimen."],
  open: ["🖐️ Halo, manusia.", "Tangan berhasil terdeteksi."]
};

function drawHand(points) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 1.5);

  if (
    canvas.width !== Math.round(rect.width * scale) ||
    canvas.height !== Math.round(rect.height * scale)
  ) {
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
  }

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  if (!points) return;

  const connections = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],
    [9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],
    [0,17]
  ];

  ctx.strokeStyle = "#00a6a6";
  ctx.lineWidth = 2;

  for (const [a, b] of connections) {
    ctx.beginPath();
    ctx.moveTo(points[a].x * rect.width, points[a].y * rect.height);
    ctx.lineTo(points[b].x * rect.width, points[b].y * rect.height);
    ctx.stroke();
  }

  ctx.fillStyle = "red";

  for (const point of points) {
    ctx.beginPath();
    ctx.arc(
      point.x * rect.width,
      point.y * rect.height,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function fingerExtended(points, tip, pip) {
  // Asumsi tangan tegak dengan jari mengarah ke atas.
  return points[tip].y < points[pip].y;
}

function recognize(points) {
  const index = fingerExtended(points, 8, 6);
  const middle = fingerExtended(points, 12, 10);
  const ring = fingerExtended(points, 16, 14);
  const pinky = fingerExtended(points, 20, 18);

  const thumbUp =
    points[4].y < points[3].y &&
    points[4].y < points[0].y;

  const thumbOpen =
    Math.hypot(
      points[4].x - points[17].x,
      points[4].y - points[17].y
    ) >
    Math.hypot(
      points[3].x - points[17].x,
      points[3].y - points[17].y
    ) * 1.15;

  if (thumbUp && !index && !middle && !ring && !pinky) {
    return "thumbs";
  }

  if (index && middle && !ring && !pinky) {
    return "peace";
  }

  if (!index && !middle && !ring && !pinky && !thumbOpen) {
    return "fist";
  }

  if (index && middle && ring && pinky && thumbOpen) {
    return "open";
  }

  return "";
}

function updateMessage(gesture) {
  const now = Date.now();

  if (!gesture) {
    gestureFrames = 0;
    lastGesture = "";
    return;
  }

  if (gesture === lastGesture) {
    gestureFrames++;
  } else {
    lastGesture = gesture;
    gestureFrames = 1;
  }

  // Gesture harus stabil beberapa frame.
  if (
    gestureFrames >= 4 &&
    gesture !== shownGesture &&
    now - lastChange > 1000
  ) {
    message.textContent = responses[gesture][0];
    detail.textContent = responses[gesture][1];

    shownGesture = gesture;
    lastChange = now;
  }
}

async function startCamera() {
  startButton.disabled = true;
  statusText.textContent = "Memuat model...";

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    tracker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "CPU"
      },
      runningMode: "VIDEO",
      numHands: 1
    });

    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 480 },
        height: { ideal: 360 }
      }
    });

    video.srcObject = stream;
    await video.play();

    running = true;
    statusText.textContent = "Kamera aktif. Cari tangan...";
    startButton.textContent = "Kamera aktif";
    requestAnimationFrame(loop);
  } catch (error) {
    console.error(error);
    statusText.textContent = "Gagal: " + error.message;
    startButton.disabled = false;
  }
}

function loop(now) {
  if (!running) return;

  if (
    video.readyState >= 2 &&
    video.currentTime !== lastVideoTime &&
    now - lastDetect > 80
  ) {
    const result = tracker.detectForVideo(video, now);
    const points = result.landmarks?.[0];

    drawHand(points || null);

    if (points) {
      statusText.textContent = "Tangan terdeteksi";
      updateMessage(recognize(points));
    } else {
      statusText.textContent = "Cari tangan di depan kamera...";
      drawHand(null);
      updateMessage("");
      shownGesture = "";
    }

    lastVideoTime = video.currentTime;
    lastDetect = now;
  }

  requestAnimationFrame(loop);
}

startButton.addEventListener("click", startCamera);

window.addEventListener("pagehide", () => {
  running = false;
  stream?.getTracks().forEach(track => track.stop());
  tracker?.close();
});
