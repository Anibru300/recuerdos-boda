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
 * La página (index.html) espera una respuesta JSON con { ok: true } o { status: "success" }
 * para poder confirmar al invitado que su archivo sí llegó.
 */

const FOLDER_ID = "PON_AQUI_EL_ID_DE_TU_CARPETA";

// Límite seguro por archivo: el frontend comprime imágenes, los videos deben ser < 10 MB.
// Apps Script tiene un límite aproximado de ~50 MB por POST, pero en base64 crece ~33%.
const MAX_BYTES_POR_ARCHIVO = 12 * 1024 * 1024; // 12 MB decodificados

function doPost(e) {
  const inicio = Date.now();

  try {
    if (!e.postData || !e.postData.contents) {
      console.error("doPost: No llegó postData");
      return responderJson({ ok: false, status: "error", error: "No llegaron datos" });
    }

    const datos = JSON.parse(e.postData.contents);
    console.log("Recibido archivo:", datos.nombreOriginal || "sin nombre", "tamaño base64:", datos.imagen ? datos.imagen.length : 0);

    if (!datos.imagen || !datos.nombre) {
      return responderJson({ ok: false, status: "error", error: "Faltan datos (nombre o archivo)" });
    }

    const bytesDecodificados = Utilities.base64Decode(datos.imagen);

    if (bytesDecodificados.length > MAX_BYTES_POR_ARCHIVO) {
      console.warn("Archivo demasiado grande:", bytesDecodificados.length, "bytes");
      return responderJson({
        ok: false,
        status: "error",
        error: "Archivo demasiado grande para el servidor (máx ~12MB por archivo)"
      });
    }

    const carpeta = DriveApp.getFolderById(FOLDER_ID);

    const mimeType = datos.mimeType || "application/octet-stream";
    const nombreFinal = generarNombreArchivo(datos);

    const blob = Utilities.newBlob(bytesDecodificados, mimeType, nombreFinal);
    const archivo = carpeta.createFile(blob);

    // Si el invitado escribió un mensaje, guardarlo como archivo de texto
    if (datos.mensaje && String(datos.mensaje).trim() !== "") {
      try {
        const nombreMensaje = nombreFinal.replace(/\.[^/.]+$/, "") + "_mensaje.txt";
        const blobMensaje = Utilities.newBlob(
          "De: " + datos.nombre + "\n\n" + datos.mensaje,
          "text/plain",
          nombreMensaje
        );
        carpeta.createFile(blobMensaje);
      } catch (err) {
        console.warn("No se pudo guardar el mensaje adjunto:", err.message);
      }
    }

    const duracion = Date.now() - inicio;
    console.log("Archivo guardado:", archivo.getName(), "id:", archivo.getId(), "en", duracion, "ms");

    return responderJson({
      ok: true,
      status: "success",
      archivo: archivo.getName(),
      id: archivo.getId()
    });

  } catch (error) {
    console.error("Error en doPost:", error);
    return responderJson({ ok: false, status: "error", error: error.message });
  }
}

// Nombre final: 2026-08-16_14-30-05_NombreInvitado_foto.jpg
function generarNombreArchivo(datos) {
  const fecha = Utilities.formatDate(new Date(), "America/Mexico_City", "yyyy-MM-dd_HH-mm-ss");
  const invitado = String(datos.nombre).trim().replace(/[^\wáéíóúñü ]/gi, "").substring(0, 50) || "Invitado";
  const original = datos.nombreOriginal || ("archivo." + (datos.extension || "bin"));
  return fecha + "_" + invitado + "_" + original;
}

function responderJson(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
