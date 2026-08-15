# 💍 Recuerdos de Boda

Página web para que los invitados suban fotos y videos de la boda directamente a una carpeta de Google Drive.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página que ven los invitados (se puede publicar con GitHub Pages) |
| `apps-script.gs` | El código del Google Apps Script que recibe los archivos y los guarda en Drive |

## Cómo funciona

1. El invitado escribe su nombre y selecciona fotos/videos.
2. La página valida límites (máx. 10 archivos, 10MB por archivo, 50MB en total).
3. Cada archivo se convierte a base64 y se envía al Apps Script.
4. El Apps Script lo guarda en la carpeta de Drive y responde `{ "status": "success" }`.
5. La página **verifica la respuesta** y le confirma al invitado si la subida funcionó o falló.

## Despliegue

### 1. Backend (Google Apps Script)
Sigue las instrucciones paso a paso que están al inicio de `apps-script.gs`.
La URL `/exec` que te da Google va en la constante `SCRIPT_URL` de `index.html`.

### 2. Frontend (GitHub Pages)
1. En el repo: **Settings → Pages**
2. Source: rama `main`, carpeta `/ (root)`
3. Tu página queda en `https://anibru300.github.io/recuerdos-boda/`

## Límites

- Los límites (10 archivos / 10MB / 50MB) se ajustan en las constantes `MAX_*` de `index.html`.
- Google Apps Script tiene un límite de ~50MB por petición POST, así que no conviene subir mucho más de eso por archivo.
