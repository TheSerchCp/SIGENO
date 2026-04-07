/**
 * AppRootLayout - Web Component para el layout raíz de la aplicación
 * Componente principal que inicializa el router y gestiona la navegación general
 * 
 * Responsabilidades:
 * - Cargar la estructura HTML raíz
 * - Instanciar el router principal
 * - Proporcionar el outlet para renderizar rutas
 * - Exponer globalmente el router para navegación desde componentes
 * - Agregar componentes globales (Toast, Loader, Modal)
 */
import { Router } from "../../router/router.js";
import { BaseComponent } from "../../services/general/BaseComponent.js";
import "../../components/loader/loader.js";
import "../../components/toast/toast.js";
import "../../components/modal/modal.js";

class AppRootLayout extends BaseComponent {
  /**
   * Se ejecuta cuando el componente se añade al DOM
   * 
   * Proceso:
   * 1. Carga el archivo HTML del root layout
   * 2. Clona la template en el DOM
   * 3. Obtiene el outlet para renderizar componentes
   * 4. Instancia el router con el outlet
   * 5. Carga la ruta inicial
   * 6. Expone el router globalmente en window.appRouter
   * 7. Agrega componentes globales
   */
  async connectedCallback() {
    try{
      
      await this.loadTemplate('/src/layout/root-layout/root-layout.html', '#root-layout-template');
      // const templateLoader = TemplateLoader.getInstance();
      // const template = await templateLoader.load(
      //   '/components/root-layout/root-layout.html',
      //   '#root-layout-template');

    //Se inserta el template en el DOM para que se ejecute el código de los componentes hijos
    //  this.appendChild(template);

      // Agregar componentes globales
      this.addGlobalComponents();

      // Obtener el outlet donde se cargarán las rutas
      const outlet = this.querySelector("#root-outlet");
      this.router = new Router(outlet);
      
      // Exponer el router globalmente para navegación desde otros componentes
      window.appRouter = this.router;
      this.router.loadRoute();
    }catch(err){
      console.error("Error al cargar root layout")
    }
  }

  /**
   * Agrega componentes globales al body (Loader, Toast y Modal)
   */
  addGlobalComponents() {
    // Agregar loader si no existe
    if (!document.querySelector('app-loader')) {
      const loader = document.createElement('app-loader');
      document.body.insertBefore(loader, document.body.firstChild);
      console.log('✓ Loader agregado al body');
    }

    // Agregar toast si no existe
    if (!document.querySelector('app-toast')) {
      const toast = document.createElement('app-toast');
      document.body.appendChild(toast);
      console.log('✓ Toast agregado al body');
    }

    // Agregar modal si no existe
    if (!document.querySelector('app-modal')) {
      const modal = document.createElement('app-modal');
      document.body.appendChild(modal);
      console.log('✓ Modal agregado al body');
    }
  }
}

/**
 * Registra el componente AppRootLayout en el navegador
 * Permite usar <root-layout></root-layout> en el HTML
 */
customElements.define('root-layout',AppRootLayout);

