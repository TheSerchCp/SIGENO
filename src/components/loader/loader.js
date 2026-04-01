import { BaseComponent } from '../../services/general/BaseComponent.js';
import { loadingService } from '../../services/general/loading.service.js';

/**
 * LOADER COMPONENT - Componente de carga global
 * 
 * Muestra un overlay con spinner mientras se carga
 * Se activa/desactiva mediante loadingService
 * 
 * Uso:
 * 1. Agregar al layout: <app-loader></app-loader>
 * 2. Mostrar: loadingService.show()
 * 3. Ocultar: loadingService.hide()
 */

export class LoaderComponent extends BaseComponent {
  async connectedCallback() {
    await this.loadTemplate('/src/components/loader/loader.html', '#loader-template');
    
    // Esperar a que el DOM esté actualizado
    await new Promise(resolve => setTimeout(resolve, 0));
    
    this.cacheDom();
    this.subscribeToLoadingState();
    
    console.log('✓ Loader component inicializado');
  }

  cacheDom() {
    this.overlay = this.querySelector('#loader-overlay');
    this.loaderText = this.querySelector('#loader-text');
    
    if (!this.overlay) {
      console.error('No se encontró #loader-overlay');
    }
  }

  subscribeToLoadingState() {
    // Suscribirse a cambios del estado de carga
    loadingService.isLoading.subscribe(isLoading => {
      console.log('Loader state changed:', isLoading);
      
      if (isLoading) {
        this.show();
      } else {
        this.hide();
      }
    });
  }

  show() {
    if (this.overlay) {
      this.overlay.classList.remove('hidden');
      console.log('Loader mostrado');
    }
  }

  hide() {
    if (this.overlay) {
      this.overlay.classList.add('hidden');
      console.log('Loader ocultado');
    }
  }

  setText(text) {
    if (this.loaderText) {
      this.loaderText.textContent = text;
    }
  }

  resetText() {
    if (this.loaderText) {
      this.loaderText.textContent = 'Cargando...';
    }
  }
}

customElements.define('app-loader', LoaderComponent);
