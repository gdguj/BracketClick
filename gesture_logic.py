import cv2
import mediapipe as mp
import math
import os
import time
from datetime import datetime
from mediapipe.tasks.python.vision import HandLandmarker, HandLandmarkerOptions, RunningMode
from mediapipe.tasks.python import BaseOptions

# --- distance between points ---   
def dist(a,b):
    return math.hypot(a.x-b.x,a.y-b.y)

# --- angle between fingers ---
def angle_between_fingers(b1,t1,b2,t2):
    dx1,dy1=t1.x-b1.x,t1.y-b1.y
    dx2,dy2=t2.x-b2.x,t2.y-b2.y
    dot=dx1*dx2+dy1*dy2
    mag1=math.sqrt(dx1**2+dy1**2)
    mag2=math.sqrt(dx2**2+dy2**2)
    if mag1*mag2==0: return 0
    cosv=max(-1,min(1,dot/(mag1*mag2)))
    return math.degrees(math.acos(cosv))

# --- check gesture for one hand ---
def check_brackets_gesture(lm):
    wrist=lm[0]
    index_len=dist(wrist,lm[8])
    middle_len=dist(wrist,lm[12])
    ring_len=dist(wrist,lm[16])
    pinky_len=dist(wrist,lm[20])
    two_main=index_len>ring_len*1.1 and middle_len>pinky_len*1.1

    ix,iy=lm[8].x-lm[5].x,lm[8].y-lm[5].y
    mx,my=lm[12].x-lm[9].x,lm[12].y-lm[9].y

    horizontal_index=abs(ix)>abs(iy)*0.5
    horizontal_middle=abs(mx)>abs(my)*0.5
    same_direction=(ix>0 and mx>0) or (ix<0 and mx<0)

    inter_angle=angle_between_fingers(lm[5],lm[8],lm[9],lm[12])
    angle_ok=10<=inter_angle<=90

    return two_main and horizontal_index and horizontal_middle and same_direction and angle_ok

# --- folder setup ---
SAVE_FOLDER="captured_photos"
os.makedirs(SAVE_FOLDER,exist_ok=True)

# --- webcam ---
cap=cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH,640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT,480)

# --- model ---
options=HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="hand_landmarker.task"),
    running_mode=RunningMode.VIDEO,
    num_hands=2
)
detector=HandLandmarker.create_from_options(options)

frame_id=0
countdown_started=False
countdown_start_time=0
COUNTDOWN_SECONDS = 3

while True:
    ok,frame=cap.read()
    if not ok: break
    h,w,_=frame.shape

    mp_image=mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
    )

    result=detector.detect_for_video(mp_image,frame_id)

    left_ok=False
    right_ok=False

    # --- copy frame for display with landmarks ---
    display_frame = frame.copy()

    if result.hand_landmarks:
        for lm,handedness in zip(result.hand_landmarks,result.handedness):
            label=handedness[0].category_name
            hand_valid=check_brackets_gesture(lm)

            # draw landmarks + lines only on display_frame
            for p in lm:
                cv2.circle(display_frame,(int(p.x*w),int(p.y*h)),4,(0,255,0),-1)
            cv2.line(display_frame,(int(lm[5].x*w),int(lm[5].y*h)),
                     (int(lm[8].x*w),int(lm[8].y*h)),(255,0,0),2)
            cv2.line(display_frame,(int(lm[9].x*w),int(lm[9].y*h)),
                     (int(lm[12].x*w),int(lm[12].y*h)),(0,0,255),2)

            if label=="Left": left_ok=hand_valid
            else: right_ok=hand_valid

    gesture_detected = left_ok and right_ok

    # --- countdown logic ---
    if gesture_detected and not countdown_started:
        countdown_started=True
        countdown_start_time=time.time()

    if countdown_started:
        elapsed=time.time()-countdown_start_time
        remaining=max(0,COUNTDOWN_SECONDS-int(elapsed))
        # put countdown text only on display_frame
        cv2.putText(display_frame,f"Capturing in {remaining}",(30,50),
                    cv2.FONT_HERSHEY_SIMPLEX,1,(0,255,0),2)
        if elapsed>=COUNTDOWN_SECONDS:
            timestamp=datetime.now().strftime("%Y%m%d_%H%M%S")
            filename=f"photo_{timestamp}.jpg"
            filepath=os.path.join(SAVE_FOLDER,filename)
            # save clean frame without landmarks
            cv2.imwrite(filepath,frame)
            print(f"Photo saved: {filename}")
            countdown_started=False

    # show display frame with landmarks & countdown
    cv2.imshow("BracketClick Photo Booth",display_frame)
    frame_id+=1

    if cv2.waitKey(1)&0xFF==27:
        break

cap.release()
cv2.destroyAllWindows()