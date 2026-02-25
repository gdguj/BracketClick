import cv2
from flask import Flask, Response
import gesture_logic

app = Flask(__name__)

# Single camera and detector (shared for the stream)
_cap = None
_detector = None
_frame_id = 0
_countdown_started = False
_countdown_start_time = 0


def get_camera():
    global _cap, _detector
    if _cap is None or not _cap.isOpened():
        _cap, _detector = gesture_logic.get_camera_and_detector()
    return _cap, _detector


def generate_frames():
    global _frame_id, _countdown_started, _countdown_start_time
    cap, detector = get_camera()
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        display_frame, _countdown_started, _countdown_start_time, _ = gesture_logic.process_frame(
            frame, _frame_id, detector, _countdown_started, _countdown_start_time
        )
        _frame_id += 1
        _, jpeg = cv2.imencode(".jpg", display_frame)
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n")


@app.route("/")
def index():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
