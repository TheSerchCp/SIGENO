/**
 * TOAST SERVICE - Servicio global para notificaciones tipo toast
 * 
 * Propósito:
 * - Mostrar notificaciones temporales (success, error, info, warning)
 * - Controlar duración de visualización
 * - Permitir cerrar manualmente
 * - Soportar múltiples toasts simultáneos
 * - Personalizar mensaje y descripción
 * 
 * Uso:
 * import { toastService } from './toast.service.js';
 * 
 * // Notificaciones simples
 * toastService.success('Operación exitosa');
 * toastService.error('Algo salió mal');
 * toastService.info('Información útil');
 * toastService.warning('Advertencia');
 * 
 * // Con descripción
 * toastService.success('Guardado', 'Los cambios se guardaron correctamente', 3000);
 * 
 * // Con duración personalizada (milisegundos)
 * toastService.success('Éxito', 'Mensaje', 5000); // 5 segundos
 * 
 * // Duración infinita (hasta que el usuario cierre)
 * toastService.error('Error crítico', 'Contacte soporte', 0);
 */

import { ReactivoBehavior } from './ReactiveBehavior.js';

class ToastService {
  constructor() {
    // ReactivoBehavior que contiene la cola de toasts
    this.toastQueue = new ReactivoBehavior([]);
    
    // Contador para generar IDs únicos
    this.toastCounter = 0;
    
    // Duración por defecto (4 segundos)
    this.defaultDuration = 4000;
  }

  /**
   * Genera un ID único para cada toast
   * @returns {string}
   */
  generateToastId() {
    return `toast-${Date.now()}-${++this.toastCounter}`;
  }

  /**
   * Agrega un toast a la cola
   * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
   * @param {string} message - Mensaje principal
   * @param {string} description - Descripción adicional (opcional)
   * @param {number} duration - Duración en milisegundos (0 = infinito)
   * @returns {string} - ID del toast
   */
  addToast(type, message, description = '', duration = this.defaultDuration) {
    const toastId = this.generateToastId();
    
    const toast = {
      id: toastId,
      type,
      message,
      description,
      duration,
      timestamp: Date.now()
    };
    
    const currentToasts = this.toastQueue.getValue();
    this.toastQueue.next([...currentToasts, toast]);
    
    console.log(`📬 Toast agregado: [${type}] ${message}`);
    
    return toastId;
  }

  /**
   * Elimina un toast por su ID
   * @param {string} toastId - ID del toast a eliminar
   */
  removeToast(toastId) {
    const currentToasts = this.toastQueue.getValue();
    const filteredToasts = currentToasts.filter(t => t.id !== toastId);
    this.toastQueue.next(filteredToasts);
  }

  /**
   * Muestra un toast de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {string} description - Descripción adicional (opcional)
   * @param {number} duration - Duración en ms (default: 4000)
   * @returns {string} - ID del toast
   */
  success(message, description = '', duration = this.defaultDuration) {
    return this.addToast('success', message, description, duration);
  }

  /**
   * Muestra un toast de error
   * @param {string} message - Mensaje a mostrar
   * @param {string} description - Descripción adicional (opcional)
   * @param {number} duration - Duración en ms (default: 4000)
   * @returns {string} - ID del toast
   */
  error(message, description = '', duration = this.defaultDuration) {
    return this.addToast('error', message, description, duration);
  }

  /**
   * Muestra un toast de información
   * @param {string} message - Mensaje a mostrar
   * @param {string} description - Descripción adicional (opcional)
   * @param {number} duration - Duración en ms (default: 4000)
   * @returns {string} - ID del toast
   */
  info(message, description = '', duration = this.defaultDuration) {
    return this.addToast('info', message, description, duration);
  }

  /**
   * Muestra un toast de advertencia
   * @param {string} message - Mensaje a mostrar
   * @param {string} description - Descripción adicional (opcional)
   * @param {number} duration - Duración en ms (default: 4000)
   * @returns {string} - ID del toast
   */
  warning(message, description = '', duration = this.defaultDuration) {
    return this.addToast('warning', message, description, duration);
  }

  /**
   * Limpia todos los toasts
   */
  clear() {
    this.toastQueue.next([]);
    console.log('🗑️ Todos los toasts fueron limpiados');
  }

  /**
   * Obtiene la cola actual de toasts
   * @returns {Array}
   */
  getToasts() {
    return this.toastQueue.getValue();
  }

  /**
   * Obtiene la cantidad de toasts activos
   * @returns {number}
   */
  getToastCount() {
    return this.toastQueue.getValue().length;
  }

  /**
   * Cambia la duración por defecto
   * @param {number} duration - Nueva duración en ms
   */
  setDefaultDuration(duration) {
    this.defaultDuration = duration;
  }
}

// Exportar instancia única (singleton)
export const toastService = new ToastService();
