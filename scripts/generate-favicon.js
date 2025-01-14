const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure the public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Create a simple colored square as the base icon
const size = 512;
const icon = Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#F5F1EA"/>
  <text x="50%" y="50%" font-family="Arial" font-size="240" font-weight="bold" fill="#2C2C2C" text-anchor="middle" dominant-baseline="middle">
    DB
  </text>
</svg>`);

// Generate different sizes
const sizes = {
  favicon: 32,
  icon: 192,
  apple: 180,
};

// Generate PNG files
Object.entries(sizes).forEach(([name, size]) => {
  sharp(icon)
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, `${name === 'favicon' ? 'favicon' : name}-icon.png`))
    .catch(console.error);
}); 