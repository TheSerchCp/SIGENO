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
    group relative overflow-hidden
    backdrop-blur-sm bg-white/5
    border border-white/10
    shadow-[0_8px_32px_rgba(0,0,0,0.35)]
    text-white
    rounded-xl
    px-4 py-3
    flex items-center gap-4
    min-w-[320px] max-w-md
    transition-all duration-300
    hover:bg-white/10
    animate-slide-in-right
  `;

  const { icon, iconBg, accent } = this.getVisualConfig(toast.type);

  toastEl.innerHTML = `
    <!-- Accent line -->
    <div class="absolute left-0 top-0 h-full w-[3px] ${accent}"></div>

    <!-- Icon -->
    <div class="flex items-center justify-center w-10 h-10 rounded-full ${iconBg}">
      <span class="text-lg">${icon}</span>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <p class="font-semibold text-sm">${toast.message}</p>
      ${
        toast.description
          ? `<p class="text-xs text-white/70 mt-0.5">${toast.description}</p>`
          : ''
      }
    </div>

    <!-- Close -->
    <button class="close-btn text-white/40 hover:text-white/80 transition cursor-pointer text-lg">
      ✕
    </button>
  `;

  const closeBtn = toastEl.querySelector('.close-btn');

  closeBtn.addEventListener('click', () => {
    toastEl.classList.add('animate-slide-out-right');
    setTimeout(() => toastService.removeToast(toast.id), 300);
  });

  if (toast.duration && toast.duration > 0) {
    setTimeout(() => {
      if (this.container.contains(toastEl)) {
        toastEl.classList.add('animate-slide-out-right');
        setTimeout(() => toastService.removeToast(toast.id), 300);
      }
    }, toast.duration);
  }

  return toastEl;
}


getVisualConfig(type) {
  const config = {
    success: {
      icon: '✓',
      iconBg: 'bg-green-500/20 text-green-400',
      accent: 'bg-green-400'
    },
    error: {
      icon: '✕',
      iconBg: 'bg-red-500/20 text-red-400',
      accent: 'bg-red-400'
    },
    info: {
      icon: 'ℹ',
      iconBg: 'bg-blue-500/20 text-blue-400',
      accent: 'bg-blue-400'
    },
    warning: {
      icon: '⚠',
      iconBg: 'bg-yellow-500/20 text-yellow-400',
      accent: 'bg-yellow-400'
    }
  };

  return config[type] || config.info;
}


}

customElements.define('app-toast', ToastComponent);
