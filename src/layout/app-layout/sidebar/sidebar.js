/**
 * AppSidebar - Web Component para la barra lateral de navegación
 * Componente reutilizable que carga el contenido de la barra lateral
 * 
 * Responsabilidades:
 * - Mostrar menú de navegación principal
 * - Proporcionar acceso a secciones de la aplicación
 * - Permitir colapso/expansión (opcional)
 * - Mostrar estado actual de navegación
 */
import { BaseComponent } from '/src/services/general/BaseComponent.js';

class AppSidebar extends BaseComponent {
  /**
   * Se ejecuta cuando el componente se añade al DOM
   * 
   * Proceso:
   * 1. Realiza fetch al archivo sidebar.html
   * 2. Clona la template en el DOM
   * 3. El menú se carga y está disponible para interacción
   */
  async connectedCallback() {
     await this.loadTemplate(
      '/src/layout/app-layout/sidebar/sidebar.html', 
      '#sidebar-template');
  }
}

/**
 * Registra el componente AppSidebar en el navegador
 * Permite usar <app-sidebar></app-sidebar> en el HTML
 */
customElements.define('app-sidebar', AppSidebar);


/*
COMO AÑADIR ITEMS DINAMICOS SEGUN EL ROL, RECOMENDACION:

  Arquitectura recomendada:

  1. Servicio de Roles/Menú:

   // src/services/AuthService.js
   export class AuthService {
     static getInstance() {
       if (!this.instance) {
         this.instance = new AuthService();
       }
       return this.instance;
     }

     // Menú base según cada rol
     #menusByRole = {
       admin: [
         { label: 'Dashboard', href: '/', icon: 'home' },
         { label: 'Usuarios', href: '/users', icon: 'users' },
         { label: 'Reportes', href: '/reports', icon: 'chart' },
         { label: 'Configuración', href: '/config', icon: 'settings' }
       ],
       user: [
         { label: 'Dashboard', href: '/', icon: 'home' },
         { label: 'Mi Perfil', href: '/profile', icon: 'user' },
         { label: 'Mis Datos', href: '/mydata', icon: 'file' }
       ],
       guest: [
         { label: 'Home', href: '/', icon: 'home' },
         { label: 'Acerca de', href: '/about', icon: 'info' }
       ]
     };

     // Obtener rol actual
     getCurrentRole() {
       return localStorage.getItem('userRole') || 'guest';
     }

     // Obtener menú según rol
     getMenuByRole() {
       const role = this.getCurrentRole();
       return this.#menusByRole[role] || this.#menusByRole['guest'];
     }

     // Cambiar rol (cuando el usuario login)
     setRole(role) {
       localStorage.setItem('userRole', role);
     }
   }

  2. Componente Sidebar mejorado:

   // src/layout/app-layout/sidebar/sidebar.js
   import { TemplateLoader } from "../../../services/general/TemplateLoader";

   class AppSidebar extends HTMLElement {

     #menuItems = [];

     async connectedCallback() {
       const templateLoader = TemplateLoader.getInstance();
       const template = await templateLoader.load(
         '/components/layout/sidebar/sidebar.html',
         '#sidebar-template');
       this.appendChild(template);

       this.cacheDom();
       this.render();
     }

     cacheDom() {
       this.$nav = this.querySelector('[data-nav]');
     }

     set menuItems(items) {
       this.#menuItems = items;
       this.render();
     }

     get menuItems() {
       return this.#menuItems;
     }

     render() {
       if (!this.$nav) return;

       this.$nav.innerHTML = '';

       this.#menuItems.forEach(item => {
         const link = document.createElement('a');
         link.href = item.href;
         link.textContent = item.label;
         link.className = item.className || 'nav-link';
         this.$nav.appendChild(link);
       });
     }
   }

   customElements.define('app-sidebar', AppSidebar);

  3. Usar en el componente padre (AppLayout o Root):

   // src/layout/app-layout/app-layout.js
   import { AuthService } from "../../services/AuthService";

   class AppLayout extends HTMLElement {

     async connectedCallback() {
       // ... cargar template ...

       this.cacheDom();
       this.setupSidebar();
       this.handleRoleChanges();
     }

     cacheDom() {
       this.$sidebar = this.querySelector('app-sidebar');
     }

     setupSidebar() {
       const authService = AuthService.getInstance();
       const menuItems = authService.getMenuByRole();
       this.$sidebar.menuItems = menuItems;
     }

     // Escuchar cambios de rol (ejemplo con storage event)
     handleRoleChanges() {
       window.addEventListener('storage', (e) => {
         if (e.key === 'userRole') {
           this.setupSidebar();
         }
       });
     }
   }

   customElements.define('app-layout', AppLayout);


*/