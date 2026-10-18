# Hand Tracking Experiment

A small browser-based experiment using hand tracking to display text based on hand gestures.

This project was made to experiment with webcam input, hand landmarks, and basic gesture detection using plain HTML, CSS, and JavaScript.

## Features

- Hand tracking through the camera
- Hand landmark visualization
- Simple gesture recognition
- Text changes based on detected gestures
- Runs in a browser without a backend server

## Tech Stack

- HTML
- CSS
- JavaScript
- MediaPipe Hand Landmarker

## Gestures

| Gesture | Response |
| --- | --- |
| Thumbs up | Mantap! |
| Peace sign | Santai dulu. |
| Closed fist | Gas terus! |
| Open hand | Halo, manusia. |

Gesture recognition uses simple landmark-based rules, so detection may be inaccurate depending on hand position, camera angle, lighting, or occlusion.

## Getting Started

### Requirements

- A modern browser with camera support
- Internet connection to load MediaPipe and its model
- Camera permission enabled

### Run Locally

Clone the repository:

```bash
git clone https://github.com/perfectkaa/hand-particles.git
cd hand-particles
```

Start a local HTTP server using Python:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Open this address in your browser:

http://127.0.0.1:8080

Press the start button and allow camera access.

If you are using Android, open the address in Chrome on the same device.

## Project Structure

```text
hand-particles/
├── index.html
├── style.css
├── app.js
├── README.md
├── LICENSE
└── .gitignore
```

## Notes

- Camera access generally requires HTTPS or localhost.
- MediaPipe is loaded from a CDN, so an internet connection is required.
- This is an experimental project, not a production-ready gesture recognition system.
- Camera processing runs in the browser.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
