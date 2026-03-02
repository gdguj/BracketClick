import cv2
import os
import json
import time
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import gesture_logic
import threading
from email_logic2 import send_email


app = Flask(__name__)
CORS(app)

_last_saved_path = None
_cap = None
_detector = None
_frame_id = 0
_countdown_started = False
_countdown_start_time = 0
_gesture_detected = False

# JSON storage 
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
SELECTIONS_JSON = os.path.join(DATA_DIR, "selections.json")

def _load_selections():
    if not os.path.exists(SELECTIONS_JSON):
        return []
    try:
        with open(SELECTIONS_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_selections(items):
    tmp = SELECTIONS_JSON + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    os.replace(tmp, SELECTIONS_JSON)

def get_camera():
    global _cap, _detector
    if _cap is None or not _cap.isOpened():
        _cap, _detector = gesture_logic.get_camera_and_detector()
    return _cap, _detector

def generate_frames():
    global _frame_id, _countdown_started, _countdown_start_time, _gesture_detected, _last_saved_path
    cap, detector = get_camera()

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        display_frame, _countdown_started, _countdown_start_time, saved_path = gesture_logic.process_frame(
            frame, _frame_id, detector, _countdown_started, _countdown_start_time
        )

        if saved_path:
            _last_saved_path = saved_path
            print("last saved:", _last_saved_path)

        _gesture_detected = _countdown_started

        _frame_id += 1
        _, jpeg = cv2.imencode(".jpg", display_frame)
        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" +
               jpeg.tobytes() + b"\r\n")


@app.route("/status")
def status():
    if _gesture_detected:
        return jsonify({"status": "READY_TO_CAPTURE", "message": "Gesture Detected!"})
    return jsonify({"status": "WAITING", "message": "Waiting for gesture..."})

@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )

# Phase 3.3: save (email + frameId + captured image filename) into JSON
@app.route("/api/selection", methods=["POST"])
def save_selection():
    global _last_saved_path

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    frame_id = data.get("frameId")

    if not email or frame_id is None:
        return jsonify({"ok": False, "error": "Missing email or frameId"}), 400

    # wait up to 3 seconds if capture not ready
    if not _last_saved_path:
        timeout = time.time() + 3.0
        while time.time() < timeout and not _last_saved_path:
            time.sleep(0.2)

    if not _last_saved_path:
        return jsonify({"ok": False, "error": "No captured image yet"}), 400

    record = {
        "email": email,
        "frameId": int(frame_id),
        "imageFile": os.path.basename(_last_saved_path),
        "savedAt": int(time.time())
    }

    items = _load_selections()
    for item in items:
        if item.get("imageFile") == record["imageFile"]:
            return jsonify({"ok": True, "record": item, "duplicate": True}), 200
    items.append(record)
    _save_selections(items)

    print("Saved to:", SELECTIONS_JSON)
    print("saved selection:", record)
    
    #Send email in background
    threading.Thread(
    target=send_email,
    args=(email, _last_saved_path)
    ).start()

    return jsonify({"ok": True, "record": record}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
    