/**
 * GOOGLE APPS SCRIPT DATABASE FOR CONJUNTO RESIDENCIAL
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Ve a Google Sheets (sheet.new) y crea una nueva hoja de cálculo.
 * 2. En el menú superior, ve a: Extensiones -> Apps Script.
 * 3. Borra el código por defecto y pega este script.
 * 4. Guarda el proyecto (clic en el ícono de disco).
 * 5. Haz clic en "Implementar" -> "Nueva implementación".
 * 6. Selecciona el tipo: "Aplicación web".
 * 7. En la configuración:
 *    - Descripción: Base de datos Conjunto Residencial.
 *    - Ejecutar como: "Tú" (tu correo de Google).
 *    - Quién tiene acceso: "Cualquiera" (esto es CRÍTICO para que la web pueda conectarse sin autenticación de Google).
 * 8. Haz clic en "Implementar", autoriza los permisos si te los pide.
 * 9. Copia la "URL de la aplicación web" provista.
 * 10. Pega esa URL en la sección de "Configuración" del portal web del conjunto.
 */

// Configuración de CORS
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Manejar peticiones GET (Lectura de datos)
function doGet(e) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) {
      return responseJSON({ success: false, error: "Servidor ocupado. Intenta de nuevo." });
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var response = {
      success: true,
      config: getConfig(ss),
      spaces: getSpaces(ss),
      reservations: getTableData(ss, "Reservas"),
      requests: getTableData(ss, "Solicitudes"),
      pqrs: getTableData(ss, "PQRs"),
      notices: getTableData(ss, "Avisos"),
      reports: getTableData(ss, "Informes")
    };
    
    return responseJSON(response);
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// Manejar peticiones POST (Escritura y actualización de datos)
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) {
      return responseJSON({ success: false, error: "No se pudo obtener bloqueo de escritura." });
    }
    
    if (!e.postData || !e.postData.contents) {
      return responseJSON({ success: false, error: "No hay datos en la petición." });
    }
    
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var data = payload.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var result = { success: false };
    
    if (action === "updateConfig") {
      result = updateConfig(ss, data);
    } else if (action === "updateSpaces") {
      result = updateSpaces(ss, data);
    } else if (action === "addReservation") {
      result = addRow(ss, "Reservas", data);
    } else if (action === "addRequest") {
      result = addRow(ss, "Solicitudes", data);
    } else if (action === "updateRequestStatus") {
      result = updateRowStatus(ss, "Solicitudes", data.id, data.status);
    } else if (action === "addPqr") {
      result = addRow(ss, "PQRs", data);
    } else if (action === "replyPqr") {
      result = replyPqr(ss, data.id, data.reply, data.status);
    } else if (action === "addNotice") {
      result = addRow(ss, "Avisos", data);
    } else if (action === "deleteNotice") {
      result = deleteRowById(ss, "Avisos", data.id);
    } else if (action === "deleteSpace") {
      result = deleteSpace(ss, data.name);
    } else if (action === "addReport") {
      result = addRow(ss, "Informes", data);
    } else if (action === "deleteReport") {
      result = deleteRowById(ss, "Informes", data.id);
    } else {
      result = { success: false, error: "Acción no reconocida: " + action };
    }
    
    return responseJSON(result);
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// --- FUNCIONES AUXILIARES ---

// Obtener hoja o crearla si no existe
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    }
  }
  return sheet;
}

// Obtener datos de una hoja en formato JSON Array
function getTableData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var result = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      // Convertir fechas a strings legibles
      if (val instanceof Date) {
        obj[headers[j]] = val.toISOString();
      } else {
        obj[headers[j]] = val;
      }
    }
    result.push(obj);
  }
  return result;
}

// Obtener configuración del conjunto
function getConfig(ss) {
  var sheet = getOrCreateSheet(ss, "Configuracion", ["Clave", "Valor"]);
  var values = sheet.getDataRange().getValues();
  var config = {};
  for (var i = 1; i < values.length; i++) {
    config[values[i][0]] = values[i][1];
  }
  return config;
}

// Obtener lista de espacios configurados
function getSpaces(ss) {
  var sheet = getOrCreateSheet(ss, "Espacios", ["Nombre", "Capacidad", "Icono", "Costo"]);
  var values = sheet.getDataRange().getValues();
  var spaces = [];
  for (var i = 1; i < values.length; i++) {
    spaces.push({
      name: values[i][0],
      capacity: values[i][1],
      icon: values[i][2],
      cost: values[i][3]
    });
  }
  return spaces;
}

// Actualizar configuración
function updateConfig(ss, data) {
  var sheet = getOrCreateSheet(ss, "Configuracion", ["Clave", "Valor"]);
  sheet.clearContents();
  sheet.appendRow(["Clave", "Valor"]);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#e2e8f0");
  
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    sheet.appendRow([keys[i], data[keys[i]]]);
  }
  return { success: true };
}

// Actualizar lista completa de espacios
function updateSpaces(ss, dataArray) {
  var sheet = getOrCreateSheet(ss, "Espacios", ["Nombre", "Capacidad", "Icono", "Costo"]);
  sheet.clearContents();
  sheet.appendRow(["Nombre", "Capacidad", "Icono", "Costo"]);
  sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e2e8f0");
  
  for (var i = 0; i < dataArray.length; i++) {
    var space = dataArray[i];
    sheet.appendRow([space.name, space.capacity || "", space.icon || "", space.cost || 0]);
  }
  return { success: true };
}

// Añadir una fila a una hoja dinámica
function addRow(ss, sheetName, data) {
  var keys = Object.keys(data);
  var sheet = getOrCreateSheet(ss, sheetName, keys);
  
  // Asegurarse de que las cabeceras coincidan exactamente. Si la hoja ya tiene cabeceras, respetarlas
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Si la hoja estaba vacía (o recién creada)
  if (headers.length === 1 && headers[0] === "") {
    headers = keys;
    sheet.clear();
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
  }
  
  // Mapear los datos de acuerdo con los encabezados existentes
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    newRow.push(data[key] !== undefined ? data[key] : "");
  }
  
  sheet.appendRow(newRow);
  return { success: true };
}

// Actualizar estado de una fila por ID
function updateRowStatus(ss, sheetName, id, status) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: "Hoja no encontrada." };
  
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIndex = headers.indexOf("id");
  var statusIndex = headers.indexOf("status");
  
  if (idIndex === -1 || statusIndex === -1) {
    return { success: false, error: "Columnas id o status no encontradas." };
  }
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) {
      sheet.getRange(i + 1, statusIndex + 1).setValue(status);
      return { success: true };
    }
  }
  return { success: false, error: "Registro no encontrado con ID: " + id };
}

// Responder un PQR
function replyPqr(ss, id, reply, status) {
  var sheet = ss.getSheetByName("PQRs");
  if (!sheet) return { success: false, error: "Hoja PQRs no encontrada." };
  
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIndex = headers.indexOf("id");
  var statusIndex = headers.indexOf("status");
  var replyIndex = headers.indexOf("adminReply");
  var updateIndex = headers.indexOf("dateUpdated");
  
  if (idIndex === -1) return { success: false, error: "Columna id no encontrada." };
  
  // Agregar columnas si no existen
  if (statusIndex === -1) {
    sheet.insertColumnAfter(sheet.getLastColumn());
    sheet.getRange(1, sheet.getLastColumn()).setValue("status").setFontWeight("bold").setBackground("#e2e8f0");
    headers.push("status");
    statusIndex = headers.length - 1;
  }
  if (replyIndex === -1) {
    sheet.insertColumnAfter(sheet.getLastColumn());
    sheet.getRange(1, sheet.getLastColumn()).setValue("adminReply").setFontWeight("bold").setBackground("#e2e8f0");
    headers.push("adminReply");
    replyIndex = headers.length - 1;
  }
  if (updateIndex === -1) {
    sheet.insertColumnAfter(sheet.getLastColumn());
    sheet.getRange(1, sheet.getLastColumn()).setValue("dateUpdated").setFontWeight("bold").setBackground("#e2e8f0");
    headers.push("dateUpdated");
    updateIndex = headers.length - 1;
  }
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) {
      sheet.getRange(i + 1, statusIndex + 1).setValue(status);
      sheet.getRange(i + 1, replyIndex + 1).setValue(reply);
      sheet.getRange(i + 1, updateIndex + 1).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  return { success: false, error: "PQR no encontrado con ID: " + id };
}

// Eliminar fila por ID
function deleteRowById(ss, sheetName, id) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: "Hoja no encontrada." };
  
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIndex = headers.indexOf("id");
  
  if (idIndex === -1) return { success: false, error: "Columna id no encontrada." };
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "Registro no encontrado." };
}

// Eliminar un espacio
function deleteSpace(ss, name) {
  var sheet = ss.getSheetByName("Espacios");
  if (!sheet) return { success: false, error: "Hoja Espacios no encontrada." };
  
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === name) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "Espacio no encontrado." };
}
