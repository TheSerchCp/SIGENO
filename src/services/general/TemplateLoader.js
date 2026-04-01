/**
 * TEMPLATE LOADER - Servicio para cargar y cachear templates HTML
 * 
 * Propósito:
 * - Cargar templates HTML desde archivos externos
 * - Cachear templates para evitar múltiples peticiones
 * - Extraer templates por ID desde archivos HTML
 * - Optimizar performance de la aplicación
 * 
 * Beneficios del caché:
 * - Primera petición: descarga el archivo del servidor
 * - Siguientes peticiones: obtiene del caché (instantáneo)
 * - Reduce carga del servidor y ancho de banda
 * 
 * Patrones usados:
 * - Singleton: una sola instancia en toda la aplicación
 * - Lazy loading: carga templates solo cuando se necesitan
 * - Fetch API: carga asincrónica desde el servidor
 * - DOMParser: parsea HTML como un documento real
 * 
 * Ejemplo de uso:
 * const loader = TemplateLoader.getInstance();
 * const template = await loader.load('/components/form/form.html', '#form-template');
 * this.appendChild(template.cloneNode(true));
 */

export class TemplateLoader {
  /**
   * Instancia única del TemplateLoader (Singleton)
   * Se crea una sola vez y se reutiliza
   * @private
   */
  static #instance;

  /**
   * Map para almacenar templates en caché
   * 
   * Estructura:
   * {
   *   "/components/form/form.html#app-form-template": DocumentFragment,
   *   "/components/input/input.html#input-template": DocumentFragment,
   *   ...
   * }
   * 
   * Usa una clave combinada: URL + ID del template
   * Esto permite cachear múltiples templates del mismo archivo
   */
  static cache = new Map();

  /**
   * Base path para las URLs
   * 
   * Obtiene el protocolo y host del navegador
   * Ejemplo: "http://localhost:3000"
   * 
   * Se usa para construir URLs absolutas:
   * - TemplateLoader.basePath + "/components/form/form.html"
   * - Resultado: "http://localhost:3000/components/form/form.html"
   * 
   * Beneficio: funciona en cualquier dominio/puerto
   */
  static basePath = window.location.protocol + '//' + window.location.host;

  /**
   * Obtiene la instancia única del TemplateLoader
   * 
   * Patrón Singleton:
   * - Si no existe instancia: la crea
   * - Si existe: retorna la existente
   * - Garantiza una sola instancia en la aplicación
   * 
   * @returns {TemplateLoader} Instancia única del TemplateLoader
   * 
   * Ejemplo:
   * const loader1 = TemplateLoader.getInstance();
   * const loader2 = TemplateLoader.getInstance();
   * loader1 === loader2; // true - misma instancia
   */
  static getInstance() {
    if (!TemplateLoader.#instance) {
      TemplateLoader.#instance = new TemplateLoader();
    }
    return TemplateLoader.#instance;
  }

  /**
   * Carga un template desde una URL
   * 
   * Proceso completo:
   * 1. Verificar si está en caché
   * 2. Si está: retorna del caché (rápido)
   * 3. Si no: hace fetch del archivo
   * 4. Parsea el HTML
   * 5. Busca el template por ID
   * 6. Cachea el resultado
   * 7. Retorna clone del template
   * 
   * @param {string} url - Ruta al archivo HTML
   *                      Ejemplo: "/components/form/form.html"
   * @param {string} templateId - ID del template dentro del archivo
   *                             Ejemplo: "#app-form-template"
   * @returns {Promise<DocumentFragment>} Contenido del template clonado
   * 
   * Ejemplo de archivo HTML:
   * <template id="form-template">
   *   <form>
   *     <input type="text" />
   *   </form>
   * </template>
   * 
   * Lanzará error si:
   * - El archivo no existe (fetch error)
   * - El template no se encuentra en el archivo
   * 
   * @throws {Error} Si no puede cargar o encontrar el template
   */
  async load(url, templateId) {
    /**
     * Crear clave única para cachear
     * Combina URL + templateId para soportar múltiples templates
     * por archivo
     * 
     * Ejemplo: "/components/form/form.html#app-form-template"
     */
    const cacheKey = `${url}${templateId}`;

    /**
     * PASO 1: Verificar si está en caché
     * 
     * Map.has() retorna true/false si existe la clave
     * Si existe: retorna clone del caché (evita múltiples descargas)
     * 
     * ¿Por qué clonar?
     * - No queremos reutilizar el mismo nodo DOM
     * - Cada componente necesita su propia instancia
     * - cloneNode(true) copia toda la estructura HTML
     */
    if (TemplateLoader.cache.has(cacheKey)) {
      return TemplateLoader.cache.get(cacheKey).cloneNode(true);
    }

    /**
     * PASO 2: No está en caché, hacer fetch
     */
    try {
      /**
       * Construir URL absoluta
       * Ejemplo: "http://localhost:3000" + "/components/form/form.html"
       * Resultado: "http://localhost:3000/components/form/form.html"
       */
      const fullUrl = TemplateLoader.basePath + url;

      /**
       * Realizar petición HTTP
       * fetch() es nativa del navegador y retorna Promise
       * 
       * response.ok será true si status entre 200-299
       * Si la petición falla, rechaza la Promise
       */
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${url}: ${response.status}`);
      }

      /**
       * PASO 3: Obtener el HTML como texto
       * response.text() parsea el cuerpo como string
       */
      const html = await response.text();

      /**
       * PASO 4: Parsear HTML
       * 
       * ¿Por qué no usar innerHTML?
       * - innerHTML + querySelector no parsea <template> correctamente
       * - Los templates tienen propiedad .content especial
       * - DOMParser crea un documento real con todas las propiedades
       * 
       * parseFromString crea un nuevo documento DOM
       * Parámetro 'text/html' indica que parsee como documento HTML
       */
      const temp = document.createElement('div');
      temp.innerHTML = html;

      /**
       * PASO 5: Buscar el template por ID
       * 
       * querySelector busca un elemento con selector específico
       * Soporta selectores CSS: #id, .class, [atributo], etc.
       * 
       * El template ID viene como "#template-id"
       * querySelector lo entiende directamente
       */
      const template = temp.querySelector(`${templateId}`);

      /**
       * Validar que encontró el template
       * Si no existe: lanzar error informativo
       */
      if (!template) {
        throw new Error(`Template ${templateId} no encontrado en ${url}`);
      }

      /**
       * PASO 6: Cachear el resultado
       * 
       * Extraer el contenido del template usando .content
       * .content es una propiedad especial de <template>
       * que contiene el DocumentFragment sin renderizar
       * 
       * cloneNode(true) copia la estructura profundamente
       */
      const templateContent = template.content.cloneNode(true);
      TemplateLoader.cache.set(cacheKey, templateContent);

      /**
       * PASO 7: Retornar clone
       * 
       * Retorna otro clone (no el del caché)
       * Cada llamada a load() retorna una nueva instancia
       * pero todas comparten el caché
       * 
       * Esto permite:
       * - Multiples componentes usen el mismo template
       * - Sin conflictos de nodos DOM reutilizados
       */
      return templateContent.cloneNode(true);
    } catch (error) {
      /**
       * Capturar y loguear errores
       * 
       * Los errores pueden ser:
       * - Fetch error: conexión fallida, timeout, CORS
       * - Parse error: HTML inválido
       * - Template error: no encontrado
       * 
       * console.error() logueaen la consola del navegador
       * throw relanza el error para que el componente lo maneje
       */
      console.error('[TemplateLoader] Error:', error);
      throw error;
    }
  }

  /**
   * Limpia completamente el caché de templates
   * 
   * Casos de uso:
   * - Desarrollo: cambias un template y quieres recargar
   * - Testing: resetear estado entre pruebas
   * - Logout: limpiar datos del usuario
   * 
   * Ejemplo:
   * TemplateLoader.getInstance().clearCache();
   */
  clearCache() {
    TemplateLoader.cache.clear();
  }

  /**
   * Pre-carga múltiples templates para mejorar performance
   * 
   * Beneficio:
   * - Carga templates en paralelo (más rápido)
   * - Los tiene listos antes de que se usen
   * - Mejora UX: no hay esperas al renderizar
   * 
   * @param {Array<{url: string, templateId: string}>} templates
   *        Array de objetos con url y templateId
   * 
   * Ejemplo:
   * await TemplateLoader.getInstance().preload([
   *   { url: '/components/form/form.html', templateId: '#form-template' },
   *   { url: '/components/input/input.html', templateId: '#input-template' }
   * ]);
   * 
   * Proceso:
   * 1. Crear array de Promises usando map()
   * 2. Cada Promise llama a this.load()
   * 3. Usar Promise.all() para esperar todas en paralelo
   * 4. Si alguna falla, rechaza el Promise.all()
   * 
   * ¿Por qué Promise.all() y no secuencial?
   * - Promise.all: descargar todas simultáneamente (rápido)
   * - Secuencial: descargar una por una (lento)
   * - Promise.all es mejor para múltiples recursos
   */
  async preload(templates) {
    /**
     * map() retorna array de Promises
     * Cada Promise descarga un template
     */
    const promises = templates.map(t => this.load(t.url, t.templateId));
    
    /**
     * Promise.all() espera a que TODOS se completen
     * Si alguno falla, rechaza inmediatamente
     * Si todos éxito, retorna array de resultados
     */
    await Promise.all(promises);
  }
}
