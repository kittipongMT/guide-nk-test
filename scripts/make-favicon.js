const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

const logoPath = path.join(__dirname, '..', 'assets', 'images', 'logo.png');
const outDir = path.join(__dirname, '..', 'assets', 'images');

async function main() {
  if (!fs.existsSync(logoPath)) {
    console.error('ไม่พบไฟล์โลโก้:', logoPath);
    process.exit(1);
  }

  await sharp(logoPath)
    .resize(32, 32)
    .png()
    .toFile(path.join(outDir, 'favicon.png'));

  console.log('สร้าง favicon.png (32x32) เรียบร้อยที่ assets/images/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
