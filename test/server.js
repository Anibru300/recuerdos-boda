/**
 * Servidor mock local que simula el Google Apps Script.
 *
 * Uso:
 *   node test/server.js
 *
 * Luego abre en el navegador:
 *   http://localhost:3000/test.html
 *
 * El servidor guarda los archivos recibidos en test/uploads/ y responde
 * como lo haría el Apps Script real.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
};

function serveStatic(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('No encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint que simula el Apps Script
  if (url.pathname === '/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const datos = JSON.parse(body);

        if (!datos.imagen || !datos.nombre) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, status: 'error', error: 'Faltan datos' }));
          return;
        }

        // Simular fallo aleatorio del 20% para probar reintentos
        if (Math.random() < 0.2) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, status: 'error', error: 'Error simulado del servidor' }));
          return;
        }

        const buffer = Buffer.from(datos.imagen, 'base64');

        if (buffer.length > 12 * 1024 * 1024) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, status: 'error', error: 'Archivo demasiado grande' }));
          return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeName = String(datos.nombre).replace(/[^\wáéíóúñü ]/gi, '').substring(0, 30) || 'invitado';
        const fileName = `${timestamp}_${safeName}_${datos.nombreOriginal || 'archivo.bin'}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        fs.writeFileSync(filePath, buffer);

        if (datos.mensaje && String(datos.mensaje).trim() !== '') {
          const msgName = fileName.replace(/\.[^/.]+$/, '') + '_mensaje.txt';
          fs.writeFileSync(path.join(UPLOAD_DIR, msgName), `De: ${datos.nombre}\n\n${datos.mensaje}`);
        }

        console.log('✅ Guardado:', fileName, `(${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, status: 'success', archivo: fileName }));

      } catch (err) {
        console.error('Error procesando subida:', err.message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, status: 'error', error: err.message }));
      }
    });
    return;
  }

  // Servir archivos estáticos
  let filePath;
  if (url.pathname === '/' || url.pathname === '/test.html') {
    filePath = path.join(__dirname, 'test.html');
  } else {
    filePath = path.join(__dirname, url.pathname);
  }

  serveStatic(filePath, res);
});

server.listen(PORT, () => {
  console.log(`🧪 Servidor de prueba listo en http://localhost:${PORT}/test.html`);
  console.log(`📁 Los archivos subidos se guardarán en: ${UPLOAD_DIR}`);
});
