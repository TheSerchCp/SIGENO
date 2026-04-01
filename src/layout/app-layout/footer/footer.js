/**
 * AppFooter - Web Component para el pie de página
 * Componente reutilizable que carga el contenido del footer
 * 
 * Responsabilidades:
 * - Mostrar información de copyright
 * - Mostrar enlaces legales (términos, privacidad)
 * - Mostrar información de contacto
 * - Proporcionar acceso a redes sociales (opcional)
 */
import { BaseComponent } from '/src/services/general/BaseComponent.js';

class AppFooter extends BaseComponent {
  /**
   * Se ejecuta cuando el componente se añade al DOM
   * 
   * Proceso:
   * 1. Realiza fetch al archivo footer.html
   * 2. Clona la template en el DOM
   * 3. El footer se carga al final de la página
   */
  async connectedCallback() {
   await this.loadTemplate(
      '/src/layout/app-layout/footer/footer.html', 
      '#footer-template');
  }
}

/**
 * Registra el componente AppFooter en el navegador
 * Permite usar <app-footer></app-footer> en el HTML
 */
customElements.define('app-footer', AppFooter);
