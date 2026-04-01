/**
 * AppLayout - Web Component para el layout principal de la aplicación
 * Contiene la estructura base de la aplicación con topbar, sidebar, footer y router outlet
 * Se importan los subcomponentes necesarios
 * 
 * Estructura del layout:
 * ├── AppTopbar (barra superior de navegación)
 * ├── AppSidebar (barra lateral)
 * ├── router-outlet (contenedor de componentes)
 * └── AppFooter (pie de página)
 */
import '/src/layout/app-layout/topbar/topbar.js';
import '/src/layout/app-layout/sidebar/sidebar.js';
import '/src/layout/app-layout/footer/footer.js';
import { BaseComponent } from '/src/services/general/BaseComponent.js';


class AppLayout extends BaseComponent {
  /**
   * Se ejecuta cuando el componente se añade al DOM
   * 
   * Proceso:
   * 1. Carga el archivo HTML del layout
   * 2. Clona la template en el DOM
   * 3. Instancia el router con el outlet
   * 4. Carga la ruta actual
   * 5. Expone el router globalmente para acceso desde otras partes de la aplicación
   */
  async connectedCallback() {
    await this.loadTemplate('/src/layout/app-layout/app-layout.html', 
        '#app-layout-template');
  }
}

/**
 * Registra el componente AppLayout en el navegador
 * Permite usar <app-layout></app-layout> en el HTML
 */
customElements.define('app-layout', AppLayout);
