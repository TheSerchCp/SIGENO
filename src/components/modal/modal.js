import { BaseComponent } from '../../services/general/BaseComponent.js';
import { modalService } from '../../services/general/modal.service.js';

/**
 * MODAL COMPONENT - Componente modal reutilizable
 * 
 * Características:
 * - Parámetros: icono, título, mensaje
 * - Slots para contenido personalizado y botones
 * - Botones por defecto: Cancelar y Confirmar
 * - Backdrop (fondo oscuro)
 * - Centrado en pantalla
 * - Dark y Light mode
 * - Animaciones suaves
 * 
 * Uso:
 * 1. Agregar al layout: <app-modal></app-modal>
 * 2. Mostrar: modalService.show({ title, message, icon, onConfirm })
 * 3. Cerrar: modalService.close()
 */

export class ModalComponent extends BaseComponent {
  async connectedCallback() {
    await this.loadTemplate('/src/components/modal/modal.html', '#modal-template');
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    this.cacheDom();
    this.subscribeToModalEvents();
    this.setupEventListeners();
    
    console.log('✓ Modal component inicializado');
  }

  cacheDom() {
    this.backdrop = this.querySelector('#modal-backdrop');
    this.modalContent = this.querySelector('#modal-content');
    this.iconEl = this.querySelector('#modal-icon');
    this.titleEl = this.querySelector('#modal-title');
    this.messageEl = this.querySelector('#modal-message');
    this.customContentEl = this.querySelector('#modal-custom-content');
    this.cancelBtn = this.querySelector('#modal-cancel-btn');
    this.confirmBtn = this.querySelector('#modal-confirm-btn');
    
    if (!this.backdrop) {
      console.error('No se encontró #modal-backdrop');
    }
  }

  setupEventListeners() {
    // Cerrar al hacer click en cancelar
    this.cancelBtn.addEventListener('click', () => {
      this.close();
    });

    // Cerrar al hacer click en el backdrop
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });
  }

  subscribeToModalEvents() {
    // Suscribirse a cambios del modal
    modalService.modalState.subscribe(async (state) => {
      if (state.isOpen) {
        await this.openModal(state);
      }
    });
  }

  async openModal(state) {
    // Configurar contenido del modal
    this.iconEl.textContent = state.icon || 'ℹ';
    this.titleEl.textContent = state.title || 'Modal';
    this.messageEl.textContent = state.message || '';

    // Limpiar botones previos
    this.customContentEl.innerHTML = '';

    // Mostrar botones personalizados si existen
    if (state.showDefaultButtons === false && state.customButtons) {
      this.cancelBtn.style.display = 'none';
      this.confirmBtn.style.display = 'none';
      this.customContentEl.classList.remove('hidden');
      this.customContentEl.innerHTML = state.customButtons;
    } else {
      this.cancelBtn.style.display = 'block';
      this.confirmBtn.style.display = 'block';
      this.customContentEl.classList.add('hidden');

      // Configurar texto y acción del botón confirmar
      if (state.confirmText) {
        this.confirmBtn.textContent = state.confirmText;
      } else {
        this.confirmBtn.textContent = 'Confirmar';
      }

      // Guardar la función a ejecutar
      this.currentConfirmFn = state.onConfirm;
    }

    // Remover evento anterior si existe
    const newConfirmBtn = this.confirmBtn.cloneNode(true);
    this.confirmBtn.replaceWith(newConfirmBtn);
    this.confirmBtn = newConfirmBtn;

    // Agregar evento al botón confirmar
    this.confirmBtn.addEventListener('click', () => {
      if (this.currentConfirmFn && typeof this.currentConfirmFn === 'function') {
        this.currentConfirmFn();
      }
      this.close();
    });

    // Mostrar modal con animación
    this.backdrop.classList.remove('hidden');
    await new Promise(resolve => setTimeout(resolve, 10));
    this.modalContent.classList.add('scale-100', 'opacity-100');
    this.modalContent.classList.remove('scale-95', 'opacity-0');
  }

  close() {
    // Animar cierre
    this.modalContent.classList.remove('scale-100', 'opacity-100');
    this.modalContent.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      this.backdrop.classList.add('hidden');
      this.currentConfirmFn = null;
      modalService.close();
    }, 300);
  }
}

customElements.define('app-modal', ModalComponent);
