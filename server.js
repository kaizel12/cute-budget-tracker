// Server lokal sederhana CuteCuan
const http = require('http');
const fs = require('fs');
const path = require('path');

// Gunakan port 3001 (atau dari environment variable jika ada)
const PORT = parseInt(process.env.PORT, 10) || 3001;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  reqPath = reqPath.split('?')[0];

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Halaman Tidak Ditemukan 🌸</h1>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🌸✨ CuteCuan Web Server Berjalan Aktif! ✨🌸`);
  console.log(`👉 Akses di browser: http://localhost:${PORT}/`);
  console.log(`👉 Atau via IP: http://127.0.0.1:${PORT}/\n`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
