const fs = require('fs');
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
fs.writeFileSync('public/favicon.ico', pixel);
fs.writeFileSync('public/apple-touch-icon.png', pixel);
