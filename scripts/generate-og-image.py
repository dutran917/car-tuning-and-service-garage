#!/usr/bin/env python3
"""
Generate high-resolution Open Graph image (1200x630) for Quoc Duong Auto.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630

# 1. Base canvas (dark theme matching brand)
canvas = Image.new("RGB", (W, H), (16, 18, 17))

# 2. Car background
car_path = "/tmp/hero-car.webp"
if os.path.exists(car_path):
    car = Image.open(car_path).convert("RGB")
    # Resize car to cover canvas
    cw, ch = car.size
    target_ratio = W / H
    current_ratio = cw / ch
    if current_ratio > target_ratio:
        new_h = H
        new_w = int(cw * (H / ch))
    else:
        new_w = W
        new_h = int(ch * (W / cw))
    car_resized = car.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Position car towards the right
    paste_x = W - new_w
    paste_y = (H - new_h) // 2
    canvas.paste(car_resized, (paste_x, paste_y))

# 3. Create rich gradient overlay for contrast
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw_overlay = ImageDraw.Draw(overlay)

# Left-to-right gradient (solid dark on left, semi-transparent on right)
for x in range(W):
    ratio = x / W
    if ratio < 0.45:
        alpha = int(245)
    elif ratio < 0.85:
        # fade from 245 to 80
        progress = (ratio - 0.45) / 0.40
        alpha = int(245 - progress * 165)
    else:
        alpha = 80
    draw_overlay.line([(x, 0), (x, H)], fill=(16, 18, 17, alpha))

# Bottom-to-top gradient for footer contrast
for y in range(H - 140, H):
    progress = (y - (H - 140)) / 140.0
    alpha = int(progress * 180)
    draw_overlay.line([(0, y), (W, y)], fill=(16, 18, 17, alpha))

canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
draw = ImageDraw.Draw(canvas)

# 4. Fonts
font_bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
font_regular = "/System/Library/Fonts/Supplemental/Arial.ttf"

f_eyebrow = ImageFont.truetype(font_bold, 18)
f_title = ImageFont.truetype(font_bold, 54)
f_subtitle = ImageFont.truetype(font_bold, 24)
f_tags = ImageFont.truetype(font_regular, 17)
f_phone = ImageFont.truetype(font_bold, 22)
f_footer = ImageFont.truetype(font_regular, 16)

# 5. Place Logo
logo_path = "public/quocduong-auto-logo.png"
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert("RGBA")
    # scale logo to width ~ 240
    lw, lh = logo.size
    target_lw = 240
    target_lh = int(lh * (target_lw / lw))
    logo_resized = logo.resize((target_lw, target_lh), Image.Resampling.LANCZOS)
    canvas.paste(logo_resized, (70, 50), logo_resized)
    start_y = 50 + target_lh + 25
else:
    start_y = 80

# 6. Eyebrow badge
eyebrow_y = start_y
draw.rectangle([(70, eyebrow_y), (74, eyebrow_y + 18)], fill=(242, 106, 50))
draw.text((86, eyebrow_y - 1), "CAR TUNING & PROFESSIONAL SERVICE", font=f_eyebrow, fill=(242, 106, 50))

# 7. Main Title
title_y = eyebrow_y + 32
draw.text((70, title_y), "QUỐC DƯƠNG AUTO", font=f_title, fill=(255, 255, 255))

# 8. Slogan / Subtitle
sub_y = title_y + 68
draw.text((70, sub_y), "ĐỘ XE & NÂNG CẤP THEO PHONG CÁCH RIÊNG", font=f_subtitle, fill=(225, 230, 226))

# 9. Services bullet tags
tag_y = sub_y + 44
tags = "VinFast VF3 · Body Kit · Mâm Lốp · Nội Thất Nappa · Âm Thanh · Ánh Sáng"
draw.text((70, tag_y), tags, font=f_tags, fill=(170, 180, 172))

# 10. Contact Bar Pill at bottom
pill_x, pill_y = 70, H - 95
pill_w, pill_h = 490, 50
draw.rounded_rectangle([(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)], radius=6, fill=(26, 30, 28), outline=(60, 68, 64), width=1)

# Hotline indicator
draw.rectangle([(pill_x + 16, pill_y + 14), (pill_x + 20, pill_y + 36)], fill=(242, 106, 50))
draw.text((pill_x + 28, pill_y + 13), "Hotline & Zalo:  0399.513.456", font=f_phone, fill=(255, 255, 255))

# Right location & URL
site_text = "quocduong-auto.com · Cẩm Phả, Quảng Ninh"
draw.text((pill_x + pill_w + 30, pill_y + 17), site_text, font=f_footer, fill=(150, 160, 152))

# 11. Save output
output_path = "public/og-image.jpg"
canvas.save(output_path, "JPEG", quality=92, optimize=True)
print("Saved:", output_path, os.path.getsize(output_path), "bytes")

# Also save to src/app/opengraph-image.jpg
app_og = "src/app/opengraph-image.jpg"
canvas.save(app_og, "JPEG", quality=92, optimize=True)
print("Saved:", app_og, os.path.getsize(app_og), "bytes")
