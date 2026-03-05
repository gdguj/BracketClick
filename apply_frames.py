import json
import os
from PIL import Image
import cairosvg
import datetime

# --- Folders ---
images_folder = "captured_photos"             # Folder with captured photos
frames_folder = "frames"                       # Folder with SVG frames
output_folder = "framed_photos"               # Folder to save framed images
output_json_file = "Data/framed_selections.json"  # New JSON after framing

os.makedirs(output_folder, exist_ok=True)

# --- Map frameId to frame file ---
frames_dict = {
    1: "frame1.svg",
    2: "frame2.svg",
    3: "frame3.svg"
}

# --- Convert SVG to PNG ---
def svg_to_png(svg_path, png_path):
    cairosvg.svg2png(url=svg_path, write_to=png_path)

# --- Apply frame on image ---
def apply_frame(image_path, frame_path, output_path):
    base_image = Image.open(image_path).convert("RGBA")
    
    # If frame is SVG, convert it to PNG first
    if frame_path.endswith(".svg"):
        temp_frame = "temp_frame.png"
        svg_to_png(frame_path, temp_frame)
        frame_path = temp_frame
    
    frame = Image.open(frame_path).convert("RGBA")
    frame = frame.resize(base_image.size)
    
    combined = Image.alpha_composite(base_image, frame)
    
    
    output_path = output_path.rsplit('.', 1)[0] + '.png'
    combined.save(output_path, format='PNG')
    
    print(f"Saved: {output_path}")
    return output_path  

# --- Read original JSON ---
with open("Data/selections.json", "r") as f:
    selections = json.load(f)

# --- List to store new JSON data ---
framed_data = []

# --- Apply frames to all images ---
for entry in selections:
    image_file = entry["imageFile"]
    frame_id = entry["frameId"]
    email = entry["email"]
    saved_at = entry.get("savedAt")  # Keep original timestamp if present
    
    image_path = os.path.join(images_folder, image_file)
    frame_file = frames_dict.get(frame_id)
    
    if not frame_file:
        print(f"Warning: frameId {frame_id} not found!")
        continue
    
    frame_path = os.path.join(frames_folder, frame_file)
    output_path = os.path.join(output_folder, f"framed_{image_file}")
    
    # Apply frame and get the new PNG path
    output_path = apply_frame(image_path, frame_path, output_path)
    
    # Add framed image data to new JSON
    framed_data.append({
        "email": email,
        "frameId": frame_id,
        "original_image": image_file,
        "framed_image": os.path.basename(output_path),
        "savedAt": saved_at
    })

# --- Save new JSON ---
os.makedirs(os.path.dirname(output_json_file), exist_ok=True)
with open(output_json_file, "w") as f:
    json.dump(framed_data, f, indent=2)

print(f"\nAll done! JSON saved to {output_json_file}")