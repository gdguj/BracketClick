import json
import os
from PIL import Image

# Folders
images_folder = "captured_photos"
frames_folder = "frames"
output_folder = "framed_photos"
json_file = "Data/selections.json"

os.makedirs(output_folder, exist_ok=True)

# Map frameId to frame file — 6 frames with correct capitalization
frames_dict = {
    1: "Frame1.png",
    2: "Frame2.png",
    3: "Frame3.png",
    4: "Frame4.png",
    5: "Frame5.png",
    6: "Frame6.png",
}

# Apply frame 
def apply_frame(image_path, frame_path, output_path):

    base_image = Image.open(image_path).convert("RGBA")
    frame = Image.open(frame_path).convert("RGBA")

    # Resize frame to match image
    frame = frame.resize(base_image.size)

    # Overlay frame
    result = Image.alpha_composite(base_image, frame)

    # Ensure PNG output
    output_path = output_path.rsplit('.', 1)[0] + ".png"
    result.save(output_path)

    print(f"Saved: {output_path}")
    return output_path


# Read JSON 
with open(json_file, "r") as f:
    selections = json.load(f)


# Process images 
for entry in selections:

    # Skip if already framed
    if "framed_image" in entry:
        continue

    image_file = entry["imageFile"]
    frame_id = entry["frameId"]

    image_path = os.path.join(images_folder, image_file)
    frame_file = frames_dict.get(frame_id)

    if not frame_file:
        print(f"Frame ID {frame_id} not found")
        continue

    frame_path = os.path.join(frames_folder, frame_file)

    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        continue

    if not os.path.exists(frame_path):
        print(f"Frame not found: {frame_path}")
        continue

    output_name = f"framed_{image_file}"
    output_path = os.path.join(output_folder, output_name)

    # Apply frame
    framed_path = apply_frame(image_path, frame_path, output_path)

    # Update JSON
    entry["framed_image"] = os.path.basename(framed_path)


# Save updated JSON 
with open(json_file, "w") as f:
    json.dump(selections, f, indent=2)

print("\nAll frames applied and JSON updated successfully!")