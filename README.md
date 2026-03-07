# BracketClick Photo Booth

Gesture-controlled photo booth: make the **&lt; &gt;** (bracket) gesture with both hands to start a countdown and capture a photo.

## Prerequisites

- Python 3 (for backend)
- Node.js (for frontend)
- Ensure **`hand_landmarker.task`** is in the project root (MediaPipe hand model)

## Setup

```bash
git clone https://github.com/gdguj/BracketClick
cd BracketClick
```

### Backend

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

### Frontend

```bash
cd bracketclickfrontend
npm install
```

## Running the app

Start **both** the backend and the frontend (use two terminals).

### 1. Start the backend

From the project root (with venv activated):

```bash
cd python app.py
```

Backend runs at **http://127.0.0.1:5000** (camera + gesture detection + `/video_feed` stream).

### 2. Start the frontend

From `bracketclickfrontend`:

```bash
npm run dev
```

Frontend runs at **http://localhost:5173**.

### 3. Use the app

Open **http://localhost:5173** in your browser. The React app will show the live camera feed from the backend. Make the bracket gesture with both hands to trigger the countdown and capture a photo (saved in `captured_photos/`).
