import { TemplateLoader } from './TemplateLoader.js';

/**
 * BaseComponent - Clase base para todos los Web Components de la aplicación
 * 
 * Extiende HTMLElement para proporcionar métodos comunes y utilidades reutilizables
 * que simplifican el desarrollo de componentes personalizados.
 * 
 * Características principales:
 * - Carga de templates HTML mediante TemplateLoader
 * - Gestión automática de event listeners para evitar memory leaks
 * - Métodos helper para seleccionar elementos del DOM
 * - Sistema de eventos personalizados
 * - Gestión centralizada de estilos globales
 * - Integración con el sistema de Router
 * - Acceso al outlet (contenedor para componentes dinámicos)
 */
export class BaseComponent extends HTMLElement {
  
  /**
   * @private
   * Array que almacena referencias a todos los event listeners registrados
   * 
   * Estructura: [{ element, event, callback }, ...]
   * Se utiliza para remover los listeners automáticamente cuando el componente
   * se desconecta del DOM (disconnectedCallback), evitando memory leaks.
   */
  #listeners = [];

  /**
   * Carga un template HTML externo y lo añade al componente
   * 
   * @async
   * @param {string} url - Ruta del archivo HTML que contiene el template
   *                       Ejemplo: '/components/layout/sidebar/sidebar.html'
   * @param {string} templateId - ID del elemento <template> dentro del HTML
   *                              Ejemplo: '#sidebar-template'
   * 
   * @returns {Promise<void>}
   * 
   * Proceso:
   * 1. Utiliza TemplateLoader (singleton) para cargar el archivo
   * 2. Clona el contenido del template
   * 3. Añade el contenido clonado como hijo de este componente
   * 
   * Ejemplo de uso:
   * await this.loadTemplate('/components/sidebar/sidebar.html', '#sidebar-template');
   */
  async loadTemplate(url, templateId) {
    const templateLoader = TemplateLoader.getInstance();
    const template = await templateLoader.load(url, templateId);
    this.appendChild(template);
  }

  /**
   * Acceso directo a querySelector
   * 
   * Método helper que simplifica la búsqueda de un único elemento
   * dentro del componente usando selectores CSS.
   * 
   * @param {string} selector - Selector CSS para encontrar el elemento
   *                            Ejemplos: '[data-nav]', '.menu', '#header'
   * 
   * @returns {Element|null} El primer elemento que coincide, o null si no existe
   * 
   * Ejemplo:
   * const navElement = this.query('[data-nav]');
   * const title = this.query('.title');
   */
  query(selector) {
    return this.querySelector(selector);
  }

  /**
   * Acceso directo a querySelectorAll
   * 
   * Método helper para obtener todos los elementos que coincidan
   * con un selector CSS dentro del componente.
   * 
   * @param {string} selector - Selector CSS para encontrar elementos
   *                            Ejemplos: '.menu-item', 'a[href]'
   * 
   * @returns {NodeList} Lista de elementos encontrados (puede estar vacía)
   * 
   * Ejemplo:
   * const allLinks = this.queryAll('a');
   * const menuItems = this.queryAll('[data-menu-item]');
   */
  queryAll(selector) {
    return this.querySelectorAll(selector);
  }

  /**
   * Registra un event listener de forma segura y rastreable
   * 
   * Este método es fundamental para evitar memory leaks. Almacena todas
   * las referencias de listeners para poder removerlas automáticamente
   * cuando el componente se desconecta del DOM.
   * 
   * @param {string|Element} selector - Selector CSS (string) o elemento HTML directo
   *                                   Ejemplos: '[data-submit]', '.btn-primary', o document.querySelector('...')
   * @param {string} event - Nombre del evento a escuchar
   *                         Ejemplos: 'click', 'input', 'change', 'submit'
   * @param {Function} callback - Función que se ejecuta cuando ocurre el evento
   *                             Recibe el evento como parámetro
   * 
   * @returns {void}
   * 
   * Ejemplo:
   * // Usando selector CSS
   * this.listen('[data-submit]', 'click', (e) => {
   *   console.log('Botón clickeado');
   * });
   * 
   * // Usando elemento directo
   * const myButton = this.query('[data-save]');
   * this.listen(myButton, 'click', (e) => {
   *   this.saveData();
   * });
   */
  listen(selector, event, callback) {
    // Acepta tanto selectores string como elementos HTML directos
    const element = typeof selector === 'string' ? this.query(selector) : selector;
    
    if (element) {
      element.addEventListener(event, callback);
      // Registra el listener para poder removerlo después
      this.#listeners.push({ element, event, callback });
    }
  }

  /**
   * Dispara un evento personalizado (CustomEvent)
   * 
   * Permite que el componente se comunique con su componente padre
   * o con otros componentes mediante eventos personalizados.
   * 
   * @param {string} eventName - Nombre del evento personalizado
   *                             Ejemplo: 'userSelected', 'roleChanged'
   * @param {Object} detail - Datos adicionales a enviar con el evento
   *                         Por defecto es un objeto vacío {}
   * 
   * @returns {boolean} true si el evento no fue cancelado
   * 
   * Ejemplo de envío:
   * this.emit('userSelected', { userId: 123, userName: 'Juan' });
   * 
   * Ejemplo de escucha (desde el padre):
   * const sidebar = document.querySelector('app-sidebar');
   * sidebar.addEventListener('userSelected', (e) => {
   *   console.log(e.detail); // { userId: 123, userName: 'Juan' }
   * });
   */
  emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
  }

  /**
   * Añade un archivo CSS global a la página (una sola vez)
   * 
   * Verifica si el CSS ya está cargado para evitar duplicados.
   * Útil para cargar estilos específicos de un componente sin repetir
   * el mismo archivo CSS múltiples veces en la página.
   * 
   * @param {string} url - Ruta del archivo CSS
   *                       Ejemplos: '/styles/sidebar.css', '/css/theme.css'
   * 
   * @returns {void}
   * 
   * Proceso:
   * 1. Busca si ya existe un <link> con esa URL en el <head>
   * 2. Si no existe, crea un nuevo elemento <link> y lo añade al <head>
   * 3. Si ya existe, no hace nada (evita duplicados)
   * 
   * Ejemplo:
   * this.addGlobalStyles('/styles/sidebar.css');
   * this.addGlobalStyles('/styles/animations.css');
   */
  addGlobalStyles(url) {
    if (!document.head.querySelector(`link[href="${url}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
  }

  /**
   * Ciclo de vida: Se ejecuta automáticamente cuando el componente se remueve del DOM
   * 
   * Responsabilidades principales:
   * 1. Remover todos los event listeners registrados en #listeners
   * 2. Limpiar la colección de listeners
   * 
   * Importancia: Previene memory leaks. Si no se removen los listeners,
   * la memoria no se libera aunque el componente desaparezca del DOM.
   * 
   * Nota: Este método se ejecuta automáticamente. No lo llames manualmente.
   * 
   * @returns {void}
   */
  disconnectedCallback() {
    this.#listeners.forEach(({ element, event, callback }) => {
      element.removeEventListener(event, callback);
    });
    this.#listeners = [];
  }

  /**
   * Obtiene la instancia del Router desde la variable global
   * 
   * El router se configura globalmente en root-layout como window.appRouter
   * para que todos los componentes puedan acceder a él.
   * 
   * @returns {Router|null} Instancia del router, o null si no está inicializado
   * 
   * Ejemplo:
   * const router = this.getRouter();
   * if (router) router.navigate('/home');
   */
  getRouter() {
    return window.appRouter || null;
  }

  /**
   * Navega a una ruta específica mediante el Router
   * 
   * Método conveniente que combina getRouter() y navigate()
   * Útil para cambiar de página desde cualquier componente.
   * 
   * @param {string} path - Ruta destino
   *                        Ejemplos: '/home', '/users', '/profile'
   * 
   * @returns {void}
   * 
   * Ejemplo:
   * this.navigateTo('/home'); // Redirige a la página principal
   * this.navigateTo('/users'); // Redirige a usuarios
   */
  navigateTo(path) {
    const router = this.getRouter();
    if (router) {
      router.navigate(path);
    } else {
      console.warn('Router no inicializado. Asegúrate de que root-layout esté cargado.');
    }
  }

  /**
   * Obtiene el elemento outlet (#router-outlet) del componente padre
   * 
   * El outlet es el contenedor donde el router renderiza componentes dinámicos.
   * Típicamente se encuentra dentro de app-layout.
   * 
   * Útil cuando necesitas renderizar contenido dinámico dentro de tu componente.
   * 
   * @returns {Element|null} El elemento con ID "router-outlet", o null si no existe
   * 
   * Ejemplo:
   * const outlet = this.getOutlet();
   * if (outlet) {
   *   outlet.innerHTML = '<mi-componente></mi-componente>';
   * }
   */
  getOutlet() {
    return document.querySelector('#router-outlet');
  }

  /**
   * Renderiza contenido en el router-outlet
   * 
   * Método auxiliar para inyectar componentes dinámicamente en el outlet.
   * Útil para flujos donde necesitas cambiar el contenido del outlet
   * sin necesariamente navegar.
   * 
   * @param {string} htmlContent - Contenido HTML a renderizar
   *                              Ejemplo: '<home-component></home-component>'
   * 
   * @returns {boolean} true si se renderizó exitosamente, false si no hay outlet
   * 
   * Ejemplo:
   * this.renderInOutlet('<home-component></home-component>');
   * 
   * this.renderInOutlet(`<user-profile user-id="${userId}"></user-profile>`);
   */
  renderInOutlet(htmlContent) {
    const outlet = this.getOutlet();
    if (outlet) {
      outlet.innerHTML = htmlContent;
      return true;
    }
    console.warn('No se encontró #router-outlet. Asegúrate de estar dentro de app-layout.');
    return false;
  }

  /**
   * Renderiza un componente dinámico en el outlet
   * 
   * Método avanzado que permite importar y renderizar componentes dinámicamente
   * Similar a lo que hace el Router, pero desde un componente.
   * 
   * @async
   * @param {Function} componentLoader - Función que retorna un Promise con el nombre del componente
   *                                    Ejemplo: () => import('/views/home/home.js').then(() => 'home-component')
   * @param {Object} attrs - Objeto con atributos a pasar al componente
   *                        Ejemplo: { userId: '123', role: 'admin' }
   * 
   * @returns {Promise<boolean>} true si se renderizó exitosamente
   * 
   * Ejemplo:
   * await this.renderComponentInOutlet(
   *   () => import('/views/users/users.js').then(() => 'users-component'),
   *   { department: 'sales' }
   * );
   */
  async renderComponentInOutlet(componentLoader, attrs = {}) {
    try {
      const componentTag = await componentLoader();
      
      // Construir atributos HTML
      const attrString = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      
      const htmlContent = attrString 
        ? `<${componentTag} ${attrString}></${componentTag}>`
        : `<${componentTag}></${componentTag}>`;
      
      return this.renderInOutlet(htmlContent);
    } catch (error) {
      console.error('Error al renderizar componente en outlet:', error);
      return false;
    }
  }
  
  }