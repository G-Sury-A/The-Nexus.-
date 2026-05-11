const fs = require('fs');

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

const createPixelImage = (size, path) => {
  // A tiny 1x1 transparent PNG file just to have a placeholder.
  // In a real app we would want an actual icon.
  const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(path, pixel);
}

createPixelImage(192, 'public/pwa-192x192.png');
createPixelImage(512, 'public/pwa-512x512.png');
