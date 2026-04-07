import { BaseComponent } from '../../services/general/BaseComponent.js';
import { toastService } from '../../services/general/toast.service.js';

/**
 * TOAST COMPONENT - Componente de notificaciones tipo toast
 * 
 * Muestra notificaciones temporales en la esquina inferior derecha
 * Se activa/desactiva mediante toastService
 * 
 * Uso:
 * 1. Agregar al layout: <app-toast></app-toast>
 * 2. Mostrar éxito: toastService.success('Éxito')
 * 3. Mostrar error: toastService.error('Error')
 * 4. Mostrar info: toastService.info('Info')
 * 5. Mostrar warning: toastService.warning('Advertencia')
 */

export class ToastComponent extends BaseComponent {
  async connectedCallback() {
    await this.loadTemplate('/src/components/toast/toast.html', '#toast-template');
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    this.cacheDom();
    this.subscribeToToastEvents();
    
    console.log('✓ Toast component inicializado');
  }

  cacheDom() {
    this.container = this.querySelector('#toast-container');
    
    if (!this.container) {
      console.error('No se encontró #toast-container');
    }
  }

  subscribeToToastEvents() {
    // Suscribirse a nuevos toasts
    toastService.toastQueue.subscribe(toasts => {
      this.render(toasts);
    });
  }

  render(toasts) {
    this.container.innerHTML = '';
    
    toasts.forEach(toast => {
      const toastEl = this.createToastElement(toast);
      this.container.appendChild(toastEl);
    });
  }

  createToastElement(toast) {
    const toastEl = document.createElement('div');
    toastEl.className = `
      toast-item pointer-events-auto
      animate-slide-in-right
      ${this.getToastClasses(toast.type)}
      p-4 rounded-lg shadow-lg
      flex items-center gap-3
      min-w-80
      max-w-md
    `;
    
    const icon = this.getIcon(toast.type);
    
    toastEl.innerHTML = `
      <span class="text-xl">${icon}</span>
      <div class="flex-1">
        <p class="font-semibold">${toast.message}</p>
        ${toast.description ? `<p class="text-sm opacity-90">${toast.description}</p>` : ''}
      </div>
      <button class="close-btn text-lg opacity-70 hover:opacity-100 transition-opacity cursor-pointer">✕</button>
    `;
    
    const closeBtn = toastEl.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      toastEl.classList.add('animate-slide-out-right');
      setTimeout(() => {
        toastService.removeToast(toast.id);
      }, 300);
    });
    
    // Auto-close después del tiempo especificado
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        if (this.container.contains(toastEl)) {
          toastEl.classList.add('animate-slide-out-right');
          setTimeout(() => {
            toastService.removeToast(toast.id);
          }, 300);
        }
      }, toast.duration);
    }
    
    return toastEl;
  }

  getToastClasses(type) {
    const classes = {
      success: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-l-4 border-green-500',
      error: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-l-4 border-red-500',
      info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500',
      warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-l-4 border-yellow-500'
    };
    
    return classes[type] || classes.info;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✗',
      info: 'ℹ',
      warning: '⚠'
    };
    
    return icons[type] || icons.info;
  }
}

customElements.define('app-toast', ToastComponent);
