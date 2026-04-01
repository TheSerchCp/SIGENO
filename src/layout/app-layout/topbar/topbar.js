/**
 * AppTopbar - Web Component para la barra superior de la aplicación
 * Componente reutilizable que carga el contenido de la barra superior
 * 
 * Responsabilidades:
 * - Mostrar branding/logo de la aplicación
 * - Mostrar opciones de usuario/perfil
 * - Proporcionar elementos de navegación superior (opcional)
 */
import { BaseComponent } from '/src/services/general/BaseComponent.js';
class AppTopbar extends BaseComponent {

    /**
   * Define los atributos observados que desencadenan actualizaciones
   * @returns {Array} Lista de atributos a observar durante cambios
   */
  static get observedAttributes() {
    return ['text'];
  }
  /**
   * Se ejecuta cuando el componente se añade al DOM
   * 
   * Proceso:
   * 1. Realiza fetch al archivo topbar.html
   * 2. Clona la template en el DOM
   * 3. El contenido se muestra en el navegador
   */
  async connectedCallback() {
    await this.loadTemplate('/src/layout/app-layout/topbar/topbar.html', '#topbar-template');
    
    this.cacheDom();
    this.update();
  }

  

    /**
   * Se ejecuta cuando cambia un atributo observado
   * Actualiza el componente solo si está inicializado y el valor cambió
   * @param {string} name - Nombre del atributo que cambió
   * @param {string} oldValue - Valor anterior del atributo
   * @param {string} newValue - Nuevo valor del atributo
   */
  attributeChangedCallback(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.update();
    }
  }
  


  /**
   * Almacena referencias a elementos del DOM y configura escuchadores de eventos
   * 
   * Obtiene referencias a los elementos label, input y error del DOM.
   * Adjunta un escuchador de evento 'input' al elemento input que:
   * - Actualiza el atributo 'value' del componente con el valor actual
   * - Dispara un evento personalizado 'valueChange' con el nuevo valor
   * - Permite que el evento se propague a través de la jerarquía del DOM
   * 
   * @private
   */
  cacheDom() {
    this.$topbar = this.querySelector('[data-topbar]');
  }

    /**
   * Actualiza los atributos del input basándose en los valores del componente
   * Sincroniza label, id, tipo, placeholder y valor del input con los atributos del componente
   * @private
   */
  update() {
    if(this.$topbar) {
      this.$topbar.textContent = this.getAttribute('text') ?? '';
    }
  }
}

/**
 * Registra el componente AppTopbar en el navegador
 * Permite usar <app-topbar></app-topbar> en el HTML
 */
customElements.define('app-topbar', AppTopbar);
