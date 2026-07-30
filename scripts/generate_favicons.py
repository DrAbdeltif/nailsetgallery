import sys
import os
from PIL import Image, ImageOps

source_path = r"C:\Users\adrarez\.gemini\antigravity-ide\brain\5be1628b-fd76-41d4-a279-ca7f8274946f\nailset_favicon_master_1785418197363.png"
public_dir = r"d:\Projects\nailsetgallery\public"

print(f"Loading source image: {source_path}")
img = Image.open(source_path).convert("RGBA")

# Convert near-white background to fully transparent
datas = img.getdata()
new_data = []
for item in datas:
    # Check if pixel is near white (R>240, G>240, B>240)
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((255, 255, 255, 0))  # Transparent
    else:
        new_data.append(item)

img.putdata(new_data)

# Get bounding box of non-transparent region
bbox = img.getbbox()
if bbox:
    cropped = img.crop(bbox)
else:
    cropped = img

# Add padding to make square
w, h = cropped.size
max_dim = max(w, h)
pad_w = (max_dim - w) // 2
pad_h = (max_dim - h) // 2

# Create 512x512 transparent canvas
canvas_size = int(max_dim * 1.2)
master = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
offset_x = (canvas_size - w) // 2
offset_y = (canvas_size - h) // 2
master.paste(cropped, (offset_x, offset_y), cropped)

# Resize to standard 512x512
master_512 = master.resize((512, 512), Image.Resampling.LANCZOS)

# 1. Save favicon.ico (multi-resolution: 16x16, 32x32, 48x48, 64x64)
ico_path = os.path.join(public_dir, "favicon.ico")
master_512.save(
    ico_path,
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
)
print(f"Generated: {ico_path} ({os.path.getsize(ico_path)} bytes)")

# 2. Save favicon-96x96.png
png_96_path = os.path.join(public_dir, "favicon-96x96.png")
png_96 = master_512.resize((96, 96), Image.Resampling.LANCZOS)
png_96.save(png_96_path, format="PNG")
print(f"Generated: {png_96_path}")

# 3. Save apple-touch-icon.png (180x180 with elegant velvet rose backdrop for iOS)
apple_path = os.path.join(public_dir, "apple-touch-icon.png")
# Create solid velvet rose background for Apple touch icon (#6A1238)
apple_bg = Image.new("RGBA", (512, 512), (106, 18, 56, 255))
# Resize icon slightly for margin inside apple icon
icon_scaled = master_512.resize((400, 400), Image.Resampling.LANCZOS)
apple_bg.paste(icon_scaled, (56, 56), icon_scaled)
apple_180 = apple_bg.resize((180, 180), Image.Resampling.LANCZOS)
apple_180.save(apple_path, format="PNG")
print(f"Generated: {apple_path}")

# 4. Save web-app-manifest-192x192.png
manifest_192_path = os.path.join(public_dir, "web-app-manifest-192x192.png")
manifest_192 = apple_bg.resize((192, 192), Image.Resampling.LANCZOS)
manifest_192.save(manifest_192_path, format="PNG")
print(f"Generated: {manifest_192_path}")

# 5. Save web-app-manifest-512x512.png
manifest_512_path = os.path.join(public_dir, "web-app-manifest-512x512.png")
apple_bg.save(manifest_512_path, format="PNG")
print(f"Generated: {manifest_512_path}")
