/**
 * Genera test/test.html a partir de index.html,
 * reemplazando la URL del Apps Script por el servidor mock local.
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
const testPath = path.join(__dirname, 'test.html');

let html = fs.readFileSync(indexPath, 'utf8');

// Reemplazar la URL del Apps Script por el mock local
html = html.replace(
  /const SCRIPT_URL = "https:\/\/script\.google\.com\/macros\/s\/[^"]+\/exec";?/,
  'const SCRIPT_URL = "http://localhost:3000/upload";'
);

// Cambiar el título para distinguirlo
html = html.replace(
  /<title>Carlos y Jimena — Comparte tus recuerdos<\/title>/,
  '<title>Carlos y Jimena — PRUEBA LOCAL</title>'
);

fs.writeFileSync(testPath, html);
console.log('✅ test.html generado correctamente');
