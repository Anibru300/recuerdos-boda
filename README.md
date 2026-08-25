# 💍 Recuerdos de Boda

Página web para que los invitados suban fotos y videos de la boda directamente a una carpeta de Google Drive.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página que ven los invitados (se puede publicar con GitHub Pages) |
| `apps-script.gs` | El código del Google Apps Script que recibe los archivos y los guarda en Drive |

## Cómo funciona

1. El invitado escribe su nombre (opcional) y selecciona fotos/videos.
2. La página valida límites y **comprime automáticamente las fotos** para subir más rápido y sin errores.
3. Los archivos se envían **uno por uno** al Apps Script con **reintentos automáticos** si algo falla.
4. El Apps Script guarda cada archivo en la carpeta de Drive y responde `{ ok: true }`.
5. La página verifica la respuesta y confirma al invitado qué archivos subieron correctamente.

## Novedades de esta versión

- ✅ **Compresión automática de fotos** en el navegador antes de enviar.
- ✅ **Subida uno por uno** para evitar saturar Apps Script.
- ✅ **Reintentos automáticos** (hasta 3 intentos) si falla un archivo.
- ✅ **Drag & drop**: arrastra fotos directamente a la zona de carga.
- ✅ **Progreso detallado** con nombre del archivo actual.
- ✅ **Validaciones en el servidor** para evitar archivos que superen el límite de Apps Script.
- ✅ **Estado visual por archivo**: pendiente, subiendo, listo o con error.

## Despliegue

### 1. Backend (Google Apps Script)
Sigue las instrucciones paso a paso que están al inicio de `apps-script.gs`.
La URL `/exec` que te da Google va en la constante `SCRIPT_URL` de `index.html`.

### 2. Frontend (GitHub Pages)
1. En el repo: **Settings → Pages**
2. Source: rama `main`, carpeta `/ (root)`
3. Tu página queda en `https://anibru300.github.io/recuerdos-boda/`

## Límites

| Concepto | Límite |
|---|---|
| Archivos por vez | 10 |
| Tamaño por imagen original | 25 MB (se comprime automáticamente) |
| Tamaño por video | 10 MB (no se comprimen) |
| Tamaño total aproximado | 50 MB |
| Tamaño máximo por subida al servidor | ~12 MB |

> ⚠️ **Nota importante:** Google Apps Script tiene un límite de ~50 MB por petición POST y el envío en base64 aumenta el tamaño ~33%. Por eso el frontend ahora comprime imágenes y sube un archivo a la vez, con reintentos automáticos.

## Solución de problemas

**"Solo subieron 3 de 10 fotos"**
- Esto solía pasar porque el límite de payload de Apps Script se rompía al enviar muchos archivos grandes juntos. Ahora se suben uno por uno y las fotos se comprimen antes de enviar.

**"En unos celulares funciona y en otros no"**
- Los celulares con poca memoria o conexión lenta a veces fallaban al convertir archivos grandes a base64. La compresión reduce drásticamente el uso de memoria y los reintentos automáticos ayudan con redes inestables.

**"Error de red o servidor"**
- Revisa que la URL de `SCRIPT_URL` esté actualizada y que el Apps Script tenga acceso "Cualquier persona".
- Revisa los logs del Apps Script (ver `Ejecuciones` en el editor) para ver el mensaje de error exacto.
