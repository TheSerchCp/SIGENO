/**
 * SERVIDOR HTTP - Servidor SPA (Single Page Application) con resolución automática de extensiones
 * 
 * Características principales:
 * - Sirve una aplicación SPA (Single Page Application)
 * - Resuelve automáticamente extensiones faltantes (.html, .js, .json)
 * - Fallback a index.html para rutas sin extensión (routing cliente)
 * - Soporta múltiples tipos de archivos (imágenes, fuentes, etc.)
 * - Previene directory traversal attacks
 * - Sin caché para desarrollo (Cache-Control: no-cache)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio raíz del proyecto usando módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

/**
 * Mapeo de extensiones de archivo a tipos MIME
 * Necesario para que el navegador interprete correctamente cada tipo de contenido
 * 
 * Por ejemplo:
 * - .js debe ser 'application/javascript' para que el navegador lo ejecute como módulo
 * - .html debe ser 'text/html' para renderizar como documento
 * - Las imágenes y fuentes deben tener sus tipos específicos
 */
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

/**
 * Extensiones a intentar en orden de prioridad cuando la URL no tiene extensión
 * 
 * Ejemplo:
 * - URL: /components/form/form
 * - Se intenta: /components/form/form.js
 * - Si no existe: /components/form/form.html
 * - Si no existe: /components/form/form.json
 * - Si nada existe: devuelve index.html (fallback SPA)
 * 
 * El orden es importante: primero JS (módulos), luego HTML (templates), luego JSON
 */
const extensionsToTry = ['.js', '.html', '.json'];

/**
 * Sirve un archivo específico al cliente
 * 
 * @param {string} filePath - Ruta absoluta al archivo en el servidor
 * @param {http.ServerResponse} res - Objeto de respuesta HTTP
 * 
 * Proceso:
 * 1. Lee el archivo del sistema de archivos
 * 2. Determina el tipo MIME según la extensión
 * 3. Envía la respuesta HTTP con headers apropiados
 * 4. Si hay error al leer, envía error 500
 */
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error');
      return;
    }
    
    // Obtener la extensión del archivo para determinar el MIME type
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 
      'Content-Type': mimeTypes[ext] || 'text/plain',
      'Cache-Control': 'no-cache'  // Desactivar caché para desarrollo
    });
    res.end(data);
  });
}

/**
 * Intenta encontrar un archivo añadiendo extensiones automáticamente
 * Utiliza recursión para probar cada extensión en orden
 * 
 * @param {string} basePath - Ruta sin extensión (ej: /components/form/form)
 * @param {number} index - Índice actual en el array extensionsToTry
 * @param {http.ServerResponse} res - Objeto de respuesta HTTP
 * 
 * Lógica:
 * - Si probamos todas las extensiones sin éxito: devuelve index.html (SPA fallback)
 * - Si encontramos un archivo: lo sirve inmediatamente
 * - Si no existe: intenta la siguiente extensión recursivamente
 * 
 * Ejemplo de flujo:
 * tryExtensions('/components/form', 0, res)
 *   → busca /components/form.html → no existe
 *   → tryExtensions('/components/form', 1, res)
 *   → busca /components/form.js → existe → serveFile()
 */
function tryExtensions(basePath, index, res) {
  // Base case: si ya probamos todas las extensiones
  if (index >= extensionsToTry.length) {
    // Ninguna extensión funcionó, devuelve index.html como SPA fallback
    // Esto permite que el router del cliente maneje rutas que no existen en el servidor
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data || '');
    });
    return;
  }

  // Obtener la extensión actual a intentar
  const ext = extensionsToTry[index];
  const filePath = basePath + ext;

  // Verificar si el archivo existe
  fs.stat(filePath, (err) => {
    if (!err) {
      // Archivo encontrado, sírvelo
      serveFile(filePath, res);
    } else {
      // Archivo no encontrado, intenta la siguiente extensión
      tryExtensions(basePath, index + 1, res);
    }
  });
}

/**
 * Servidor HTTP principal
 * Maneja todas las peticiones del cliente
 * 
 * Flujo de procesamiento:
 * 1. Normalizar URL (raíz → index.html)
 * 2. Validar seguridad (prevenir directory traversal)
 * 3. Verificar si el archivo existe
 * 4. Si existe: servir directamente
 * 5. Si no existe y sin extensión: intentar agregar extensiones
 * 6. Si no existe y con extensión: devolver 404
 */
http.createServer((req, res) => {
  // Normalizar la URL: la raíz ("/") se convierte a "/index.html"
  let url = req.url === '/' ? '/index.html' : req.url;
  
  // Convertir URL relativa a ruta absoluta en el sistema de archivos
  // normalize() elimina ".." y "." para evitar directory traversal
  let filePath = path.normalize(path.join(__dirname, url));

  // SEGURIDAD: Verificar que la ruta resuelta está dentro del directorio del proyecto
  // Previene ataques como: ../../etc/passwd
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Verificar si el archivo existe exactamente con la ruta especificada
  fs.stat(filePath, (statErr) => {
    // CASO 1: El archivo existe con su extensión completa
    if (!statErr) {
      serveFile(filePath, res);
      return;
    }

    // CASO 2: El archivo no existe y la URL no tiene extensión
    // Intenta agregar extensiones automáticamente (.html, .js, .json)
    // Si nada funciona, devuelve index.html (SPA fallback)
    if (!path.extname(url)) {
      tryExtensions(filePath, 0, res);
      return;
    }

    // CASO 3: El archivo tiene extensión pero no existe
    // Devolver error 404
    console.warn(`[404] No encontrado: ${url} (resuelto a: ${filePath})`);
    res.writeHead(404);
    res.end('Not Found');
  });
}).listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Directorio raíz: ${__dirname}`);
});
