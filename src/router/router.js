/**
 * ROUTER - Gestor de rutas de la aplicación SPA (Single Page Application)
 * 
 * Características principales:
 * - Gestión de rutas sin recargar la página (SPA)
 * - Soporte para layouts reutilizables
 * - Carga dinámica de componentes (lazy loading)
 * - Manejo del historial del navegador (back/forward)
 * - Comunicación entre rutas y componentes
 * - Soporte para rutas dinámicas con parámetros (:id, :userId, etc.)
 * - Protección de rutas según autenticación
 * 
 * Arquitectura:
 * root-layout (contenedor principal)
 *   ├── Componentes sin layout (/login)
 *   └── app-layout (para rutas protegidas)
 *       ├── topbar, sidebar, footer
 *       └── router-outlet (donde se renderizan componentes)
 */

import { routesConfig } from './config.js';
import { loginService } from '../services/api/login.service.js';
import { toastService } from '../services/general/toast.service.js';

export class Router {
  /**
   * Constructor del Router
   * 
   * @param {HTMLElement} outlet - Elemento del DOM donde se renderizarán los componentes
   *                               Este es el contenedor principal dentro de root-layout
   * 
   * El outlet es donde el router inyecta:
   * - Componentes de login (directamente)
   * - El layout app-layout (para rutas protegidas)
   */
  constructor(outlet) {
    this.outlet = outlet;
  
    this.routes = routesConfig;

    // Escuchar cambios en el historial del navegador
    // Esto permite que el botón atrás/adelante del navegador funcione
    window.addEventListener('popstate', () => this.loadRoute());
  }

  /**
   * Encuentra la ruta que coincida con el pathname actual
   * Soporta rutas dinámicas con parámetros como /users/:id
   * 
   * @param {string} pathname - Ruta actual (ej: "/users/123")
   * @returns {Object} - { route, params } donde route es la configuración y params son los valores
   */
  findRoute(pathname) {
    // Primero intentar coincidencia exacta (más eficiente)
    if (this.routes[pathname]) {
      return { route: this.routes[pathname], params: {} };
    }

    // Luego intentar coincidencia dinámica
    for (const [pattern, route] of Object.entries(this.routes)) {
      const params = this.matchPattern(pattern, pathname);
      if (params !== null) {
        return { route, params };
      }
    }

    // Si no hay coincidencia, retornar ruta por defecto
    return { route: this.routes['/'], params: {} };
  }

  /**
   * Verifica si un pathname coincide con un patrón de ruta
   * Extrae los parámetros dinámicos
   * 
   * Ejemplos:
   * - pattern: "/users/:id", pathname: "/users/123" → { id: "123" }
   * - pattern: "/posts/:postId/edit", pathname: "/posts/5/edit" → { postId: "5" }
   * - pattern: "/users/123", pathname: "/users/123" → {} (ruta exacta)
   * - pattern: "/users/:id", pathname: "/posts/123" → null (no coincide)
   * 
   * @param {string} pattern - Patrón de ruta (ej: "/users/:id")
   * @param {string} pathname - Ruta actual (ej: "/users/123")
   * @returns {Object|null} - Parámetros extraídos o null si no coincide
   */
  matchPattern(pattern, pathname) {
    // Convertir patrón a expresión regular
    // "/users/:id" → "/users/([^/]+)"
    const paramNames = (pattern.match(/:[a-zA-Z_][a-zA-Z0-9_]*/g) || [])
      .map(p => p.substring(1));
    
    const regexPattern = pattern.replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, '([^/]+)');
    const regex = new RegExp(`^${regexPattern}$`);
    
    const match = pathname.match(regex);
    if (!match) {
      return null;
    }

    // Extraer parámetros desde los grupos de coincidencia
    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return params;
  }

  /**
   * Navega a una ruta específica
   * Actualiza el historial del navegador y carga la ruta
   * Soporta parámetros dinámicos
   * 
   * @param {string} path - Ruta a la que navegar (ej: "/home", "/users/123")
   * 
   * Flujo:
   * 1. Usar history.pushState() para agregar a historial sin recargar
   * 2. Llamar loadRoute() para renderizar la nueva ruta
   * 
   * Ejemplos de uso desde un componente:
   * window.appRouter.navigate('/home')
   * window.appRouter.navigate('/users/123')
   * window.appRouter.navigate('/posts/5/edit')
   */
  navigate(path) {
    history.pushState({}, '', path);
    this.loadRoute();
  }

  /**
   * Carga y renderiza la ruta actual
   * Soporta rutas dinámicas con parámetros
   * Incluye protección de rutas según autenticación
   * 
   * Esta es la función principal del router
   * Se llama cuando:
   * - El usuario navega a una ruta
   * - El usuario usa botón atrás/adelante
   * - La aplicación se carga inicialmente
   * 
   * Proceso de renderizado según tipo de ruta:
   * 
   * A) Ruta sin layout (ej: /login):
   *    1. Cargar componente dinámicamente (import())
   *    2. Ejecutar su código (registrar web component)
   *    3. Renderizar el HTML del componente en el outlet
   * 
   * B) Ruta con layout (ej: /home):
   *    1. Importar módulo del layout para registrarlo
   *    2. Crear instancia del web component del layout
   *    3. Agregar al DOM para que ejecute connectedCallback()
   *    4. Esperar a que el layout se inicialice
   *    5. Encontrar el router-outlet dentro del layout
   *    6. Renderizar el componente dentro del router-outlet
   * 
   * C) Ruta con parámetros (ej: /users/:id):
   *    1. Extraer parámetros del pathname
   *    2. Guardar en window.currentRouteParams
   *    3. Pasar como atributos al componente
   *    4. El componente accede a ellos en attributeChangedCallback()
   */
  async loadRoute() {
    // Obtener la ruta actual desde window.location.pathname
    // Ejemplo: si la URL es http://localhost:3000/users/123, path = "/users/123"
    const path = window.location.pathname;
    
    // PROTECCIÓN: Si intenta acceder a /login o / estando autenticado, redirigir a /home
    if ((path === '/login' || path === '/') && loginService.isLoggedIn()) {
      toastService.info(`Sesión iniciada como ${loginService.getCurrentUser().name}`);
      history.pushState({}, '', '/home');
      return this.loadRoute();
    }
    
    // Encontrar la ruta que coincida (soporta dinámicas)
    const { route, params } = this.findRoute(path);

    // Guardar parámetros globalmente para acceso desde componentes
    window.currentRouteParams = params;
    
    /**
     * CASO 1: Ruta sin layout (como /login)
     * 
     * Estas rutas renderizan el componente directamente en el outlet
     * Sin estructura de layout (sin topbar, sidebar, footer)
     */
    if (!route.layout) {
      
      // Ejecutar la función del componente
      // Esto hace el import() dinámico y retorna el HTML
      let componentHTML = await route.component();
      
      // Si hay parámetros, agregarlos como atributos al componente
      if (Object.keys(params).length > 0) {
        const attrString = Object.entries(params)
          .map(([key, value]) => ` ${key}="${value}"`)
          .join('');
        componentHTML = componentHTML.replace(/^<(\w+-\w+)/, `<$1${attrString}`);
      }
      
      // Renderizar el componente en el outlet
      this.outlet.innerHTML = componentHTML;
      return;
    }

    /**
     * CASO 2: Ruta con layout (como /home)
     * 
     * Estas rutas cargan un layout que contiene estructura completa
     * (topbar, sidebar, footer) y un router-outlet para el componente
     */
    
    // Importar el módulo del layout para registrar el web component
    // Esto hace que <app-layout></app-layout> sea reconocido
    if (route.layout === 'app-layout') {
        await import('/src/layout/app-layout/app-layout.js');
    }
    
    // Crear una instancia del web component del layout
    // Esto es equivalente a hacer <app-layout></app-layout> en HTML
    const layoutElement = document.createElement(route.layout);
    
    // Limpiar el outlet y agregar el nuevo layout
    this.outlet.innerHTML = '';
    this.outlet.appendChild(layoutElement);
    
    // Esperar a que el web component se defina en el navegador
    // Esto asegura que el connectedCallback() haya sido ejecutado
    await customElements.whenDefined(route.layout);
    
    // Dar tiempo extra a que connectedCallback() se complete
    // Algunas operaciones asincrónicas pueden necesitar este tiempo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Buscar el elemento router-outlet dentro del layout
    // Este es el contenedor donde se renderizará el componente específico
    const outlet = layoutElement.querySelector("#router-outlet");
    
    if (!outlet) {
      console.error(`No se encontró #router-outlet en ${route.layout}`);
      return;
    }

    // Cargar el componente específico para esta ruta
    let componentHTML = await route.component();
    
    // Si hay parámetros, agregarlos como atributos al componente
    if (Object.keys(params).length > 0) {
      const attrString = Object.entries(params)
        .map(([key, value]) => ` ${key}="${value}"`)
        .join('');
      componentHTML = componentHTML.replace(/^<(\w+-\w+)/, `<$1${attrString}`);
    }
    
    // Renderizar el componente dentro del router-outlet
    outlet.innerHTML = componentHTML;
  }
}

