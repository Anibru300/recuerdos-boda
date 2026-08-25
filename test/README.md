# 🧪 Pruebas locales

Esta carpeta contiene un servidor mock que simula el Google Apps Script para que puedas probar el flujo completo de subida sin tocar tu Drive real.

## Requisitos

- Tener [Node.js](https://nodejs.org/) instalado.

## Pasos

1. Genera el archivo de prueba a partir de `index.html`:

   ```bash
   node test/generate-test-html.js
   ```

2. Inicia el servidor mock:

   ```bash
   node test/server.js
   ```

3. Abre en tu navegador:

   ```
   http://localhost:3000/test.html
   ```

4. Selecciona fotos y videos como si fuera la página real.

5. Los archivos subidos se guardarán en `test/uploads/`.

## Qué se prueba

- Compresión automática de imágenes en el navegador.
- Subida secuencial de archivos.
- Reintentos automáticos cuando el servidor responde error.
- Guardado del mensaje/dedicatoria como archivo `.txt`.
- Progreso visual y estados por archivo.

## Nota

El servidor mock tiene un **20% de probabilidad de fallar intencionalmente** en cada archivo, para que puedas ver cómo funcionan los reintentos automáticos.

Para probar en un celular, asegúrate de que el celular esté en la misma red WiFi que la computadora y abre la dirección IP local de tu computadora en lugar de `localhost`.
