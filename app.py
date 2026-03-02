import cv2
from flask import Flask, Response, jsonify, request
import gesture_logic
from flask_cors import CORS 
from email_logic2 import send_email
import threading


app = Flask(__name__)
CORS(app)

_cap = None
_detector = None
_frame_id = 0
_countdown_started = False
_countdown_start_time = 0
_gesture_detected = False
_user_email = None

def get_camera():
    global _cap, _detector
    if _cap is None or not _cap.isOpened():
        _cap, _detector = gesture_logic.get_camera_and_detector()
    return _cap, _detector

def generate_frames():
    global _frame_id, _countdown_started, _countdown_start_time, _gesture_detected
    cap, detector = get_camera()
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        
        display_frame, _countdown_started, _countdown_start_time, gesture_data = gesture_logic.process_frame(
            frame, _frame_id, detector, _countdown_started, _countdown_start_time
        )

        if gesture_data and _user_email:
           print("Sending email to", _user_email)

           threading.Thread(
                   target=send_email,
                   args=(_user_email, gesture_data)
           ).start()
        
        _gesture_detected = _countdown_started 
        
        _frame_id += 1
        _, jpeg = cv2.imencode(".jpg", display_frame)
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n")

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

@app.route("/capture", methods=["POST"])
def capture():
    global _user_email
    data = request.json
    _user_email = data.get("email")

    print("Email received from frontend:", _user_email)

    return jsonify({"status": "success", "message": "Email stored"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)