// Development wrapper only. YouTube itself supplies all video/audio bytes.
const http = require('http');
const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../generated/youtube-player/index.html');
if (!fs.existsSync(file)) throw Error('Run npm run prepare:content first.');
http.createServer((request, response) => {
  if (request.url !== '/' && request.url !== '/index.html') {
    response.writeHead(404); response.end(); return;
  }
  response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8',
    'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': 'no-store'});
  response.end(fs.readFileSync(file));
}).listen(8766, '127.0.0.1', () => console.log('ArenaVoca player wrapper: http://127.0.0.1:8766 (Vega: http://10.0.2.2:8766)'));
