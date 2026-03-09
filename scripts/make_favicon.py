"""สร้าง favicon จาก assets/images/logo.png (ต้องติดตั้ง: pip install Pillow)"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ติดตั้ง Pillow ก่อน: pip install Pillow")
    sys.exit(1)

base = Path(__file__).resolve().parent.parent
logo = base / "assets" / "images" / "logo.png"
favicon = base / "assets" / "images" / "favicon.png"

if not logo.exists():
    print("ไม่พบไฟล์โลโก้:", logo)
    sys.exit(1)

img = Image.open(logo).convert("RGBA")
img = img.resize((32, 32), Image.Resampling.LANCZOS)
img.save(favicon, "PNG")
print("สร้าง favicon.png (32x32) เรียบร้อยที่ assets/images/")
