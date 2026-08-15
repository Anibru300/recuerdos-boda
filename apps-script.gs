/**
 * Google Apps Script para recibir fotos y videos de la boda.
 *
 * CÓMO INSTALARLO:
 * 1. Crea una carpeta en Google Drive (ej. "Recuerdos Boda") y copia su ID
 *    (la parte final de la URL: drive.google.com/drive/folders/ESTE_ES_EL_ID)
 * 2. Ve a script.google.com, crea un proyecto y pega este código
 * 3. Pon el ID de tu carpeta en FOLDER_ID
 * 4. Implementar > Nueva implementación > Aplicación web:
 *    - Ejecutar como: "Yo"
 *    - Quién tiene acceso: "Cualquier persona" (necesario para que la página funcione)
 * 5. Copia la URL /exec y pégala en SCRIPT_URL en index.html
 *
 * La página (index.html) espera una respuesta JSON: { "status": "success" }
 * para poder confirmar al invitado que su archivo sí llegó.
 */

const FOLDER_ID = "PON_AQUI_EL_ID_DE_TU_CARPETA";

function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);

    if (!datos.imagen || !datos.nombre) {
      return responderJson({ status: "error", mensaje: "Faltan datos (nombre o archivo)" });
    }

    const carpeta = DriveApp.getFolderById(FOLDER_ID);

    // Decodificar el archivo que viene en base64
    const bytes = Utilities.base64Decode(datos.imagen);
    const mimeType = datos.mimeType || "application/octet-stream";
    const blob = Utilities.newBlob(bytes, mimeType, generarNombreArchivo(datos));

    const archivo = carpeta.createFile(blob);

    return responderJson({
      status: "success",
      archivo: archivo.getName(),
      id: archivo.getId()
    });

  } catch (error) {
    return responderJson({ status: "error", mensaje: error.message });
  }
}

// Nombre final: 2026-08-16_14-30-05_NombreInvitado_foto.jpg
function generarNombreArchivo(datos) {
  const fecha = Utilities.formatDate(new Date(), "America/Mexico_City", "yyyy-MM-dd_HH-mm-ss");
  const invitado = String(datos.nombre).trim().replace(/[^\wáéíóúñü ]/gi, "").substring(0, 50);
  const original = datos.nombreOriginal || ("archivo." + (datos.extension || "bin"));
  return fecha + "_" + invitado + "_" + original;
}

function responderJson(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
