/**
 * AppSidebar - Web Component para la barra lateral de navegación
 * Componente reutilizable que carga el contenido de la barra lateral
 * 
 * Responsabilidades:
 * - Mostrar menú de navegación dinámico desde el servicio
 * - Mostrar información del usuario
 * - Proporcionar botón para cerrar sesión
 * - Suscribirse a cambios en las opciones del sidebar
 */
import { BaseComponent } from '/src/services/general/BaseComponent.js';
import { sidebarService } from '/src/services/general/sidebar.service.js';
import { modalService } from '/src/services/general/modal.service.js';

class AppSidebar extends BaseComponent {
  /**
   * Se ejecuta cuando el componente se añade al DOM
   * 
   * Proceso:
   * 1. Realiza fetch al archivo sidebar.html
   * 2. Clona la template en el DOM
   * 3. Se suscribe a cambios en las opciones del sidebar
   * 4. El menú se carga y está disponible para interacción
   */
  async connectedCallback() {
     await this.loadTemplate(
      '/src/layout/app-layout/sidebar/sidebar.html', 
      '#sidebar-template');
      
      this.cacheDom();
      this.setupEventListeners();
      this.initializeSidebarOptions();
      this.subscribeToSidebarOptions();
   }

  initializeSidebarOptions() {
    // Inicializar las opciones del sidebar con rutas y clases de Font Awesome
    sidebarService.setOptions([
      { label: 'Home', route: '/home', iconClass: 'fa-solid fa-house' },
      { label: 'Usuarios', route: '/users', iconClass: 'fa-solid fa-users' },
      { label: 'Configuración', route: '/settings', iconClass: 'fa-solid fa-gear' },
      { label: 'Reportes', route: '/reports', iconClass: 'fa-solid fa-chart-bar' }
    ]);
  }

  cacheDom() {
    this.$logoutBtn = this.querySelector('#logout-btn');
    this.$userEmail = this.querySelector('#user-email');
    this.$navOptions = this.querySelector('#nav-options');
  }

  setupEventListeners() {
    if (this.$logoutBtn) {
      this.$logoutBtn.addEventListener('click', () => this.handleLogout());
    }
    
    this.displayUserInfo();
  }

  /**
   * Se suscribe al servicio de sidebar para reaccionar a cambios
   * Cada vez que las opciones cambien, se re-renderiza el menú
   */
  subscribeToSidebarOptions() {
    sidebarService.options.subscribe(options => {
      this.renderNavOptions(options);
    });

    // Renderizar opciones iniciales (si las hay)
    const initialOptions = sidebarService.getOptions();
    if (initialOptions.length > 0) {
      this.renderNavOptions(initialOptions);
    }
  }

  /**
   * Renderiza las opciones de navegación dinámicamente
   * Crea elementos <button> para cada opción con evento click para navegar
   * 
   * @param {Array} options - Array de opciones con { label, route, iconClass? }
   */
  renderNavOptions(options) {
    if (!this.$navOptions) return;

    // Limpiar opciones previas
    this.$navOptions.innerHTML = '';

    // Renderizar cada opción
    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:cursor-pointer dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm text-left flex items-center gap-2';
      
      // Agregar contenido: icono Font Awesome (si existe) + label
      if (option.iconClass) {
        const iconElem = document.createElement('i');
        iconElem.className = `${option.iconClass} w-5 text-center`;
        button.appendChild(iconElem);
      }
      
      const labelElem = document.createElement('span');
      labelElem.textContent = option.label;
      button.appendChild(labelElem);

      // Navegar usando el router cuando se hace click
      button.addEventListener('click', () => {
        if (window.appRouter) {
          window.appRouter.navigate(option.route);
        } else {
          console.error('Router no disponible');
        }
      });

      this.$navOptions.appendChild(button);
    });
  }

  displayUserInfo() {
    const userEmail = localStorage.getItem('userEmail') || 'usuario@email.com';
    if (this.$userEmail) {
      this.$userEmail.textContent = userEmail;
    }
  }

  handleLogout() {
    modalService.show({
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      icon: '👋',
      confirmText: 'Cerrar sesión',
      onConfirm: () => {
        localStorage.clear();
        window.location.href = '/login';
      }
    });
  }
}

/**
 * Registra el componente AppSidebar en el navegador
 * Permite usar <app-sidebar></app-sidebar> en el HTML
 */
customElements.define('app-sidebar', AppSidebar);
