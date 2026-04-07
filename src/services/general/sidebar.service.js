/**
 * SIDEBAR SERVICE - Servicio global para manejar las opciones del sidebar
 * 
 * Propósito:
 * - Gestionar dinámicamente las opciones del menú de navegación
 * - Mantener estado reactivo de las opciones
 * - Soportar operaciones CRUD sobre opciones
 * - Integración con router para navegación
 * 
 * Uso:
 * import { sidebarService } from './sidebar.service.js';
 * 
 * // Establecer opciones
 * sidebarService.setOptions([
 *   { label: 'Dashboard', route: '/home', icon: '📊' },
 *   { label: 'Usuarios', route: '/users', icon: '👥' },
 *   { label: 'Configuración', route: '/settings', icon: '⚙️' }
 * ]);
 * 
 * // Suscribirse a cambios
 * sidebarService.options.subscribe(options => {...});
 */

import { ReactivoBehavior } from './ReactiveBehavior.js';

class SidebarService {
  constructor() {
    // ReactivoBehavior que controla las opciones del sidebar
    // Estructura de cada opción:
    // {
    //   label: string,        - Texto a mostrar
    //   route: string,        - Ruta a navegar
    //   icon?: string,        - Emoji o icono opcional
    //   id?: string           - ID único opcional
    // }
    this.options = new ReactivoBehavior([]);
  }

  /**
   * Establece todas las opciones del sidebar
   * Reemplaza las opciones existentes
   * 
   * @param {Array} options - Array de opciones
   * 
   * Ejemplo:
   * sidebarService.setOptions([
   *   { label: 'Home', route: '/home' },
   *   { label: 'Users', route: '/users', icon: '👥' }
   * ]);
   */
  setOptions(options = []) {
    if (!Array.isArray(options)) {
      console.error('setOptions requiere un array');
      return;
    }
    
    // Validar que cada opción tenga label y route
    const validOptions = options.filter(opt => {
      if (!opt.label || !opt.route) {
        console.warn('Opción inválida, debe tener label y route:', opt);
        return false;
      }
      return true;
    });
    
    this.options.next(validOptions);
  }

  /**
   * Obtiene todas las opciones actuales
   * @returns {Array}
   */
  getOptions() {
    return this.options.getValue();
  }

  /**
   * Agrega una opción al final del array
   * 
   * @param {Object} option - Opción a agregar
   * 
   * Ejemplo:
   * sidebarService.addOption({ label: 'Reportes', route: '/reports' });
   */
  addOption(option) {
    if (!option.label || !option.route) {
      console.error('Opción inválida, debe tener label y route:', option);
      return;
    }
    
    const currentOptions = this.getOptions();
    this.setOptions([...currentOptions, option]);
  }

  /**
   * Remueve una opción por index
   * 
   * @param {number} index - Índice de la opción a remover
   * 
   * Ejemplo:
   * sidebarService.removeOption(1); // Remueve la segunda opción
   */
  removeOption(index) {
    const currentOptions = this.getOptions();
    if (index >= 0 && index < currentOptions.length) {
      const newOptions = currentOptions.filter((_, i) => i !== index);
      this.setOptions(newOptions);
    }
  }

  /**
   * Remueve una opción por ID
   * 
   * @param {string} id - ID de la opción a remover
   * 
   * Ejemplo:
   * sidebarService.removeOptionById('users-page');
   */
  removeOptionById(id) {
    const currentOptions = this.getOptions();
    const newOptions = currentOptions.filter(opt => opt.id !== id);
    this.setOptions(newOptions);
  }

  /**
   * Actualiza una opción existente
   * 
   * @param {number} index - Índice de la opción
   * @param {Object} updatedOption - Propiedades a actualizar
   * 
   * Ejemplo:
   * sidebarService.updateOption(0, { label: 'Mi Dashboard' });
   */
  updateOption(index, updatedOption) {
    const currentOptions = this.getOptions();
    if (index >= 0 && index < currentOptions.length) {
      currentOptions[index] = { ...currentOptions[index], ...updatedOption };
      this.setOptions(currentOptions);
    }
  }

  /**
   * Limpia todas las opciones
   * 
   * Ejemplo:
   * sidebarService.clearOptions();
   */
  clearOptions() {
    this.setOptions([]);
  }

  /**
   * Reinicia el servicio a su estado inicial
   */
  reset() {
    this.clearOptions();
  }
}

// Exportar instancia única (singleton)
export const sidebarService = new SidebarService();
