/**
 * LOADING SERVICE - Servicio global para manejar el estado de carga
 * 
 * Propósito:
 * - Controlar el estado del loader desde cualquier parte de la aplicación
 * - Mostrar/ocultar loader al navegar entre rutas
 * - Mostrar/ocultar loader durante llamadas a API
 * - Soportar múltiples operaciones simultáneas
 * 
 * Uso:
 * import { loadingService } from './loading.service.js';
 * 
 * loadingService.show();     // Muestra el loader
 * loadingService.hide();     // Oculta el loader
 * loadingService.isLoading.subscribe(isLoading => {...});  // Escuchar cambios
 */

import { ReactivoBehavior } from './ReactiveBehavior.js';

class LoadingService {
  constructor() {
    // ReactivoBehavior que controla si el loader está visible
    this.isLoading = new ReactivoBehavior(false);
    
    // Contador de operaciones en curso
    // Permite múltiples operaciones simultáneas
    this.operationCount = 0;
  }

  /**
   * Muestra el loader
   * Incrementa el contador de operaciones
   * 
   * Uso:
   * loadingService.show();
   */
  show() {
    this.operationCount++;
    this.isLoading.next(true);
  }

  /**
   * Oculta el loader
   * Decrementa el contador de operaciones
   * Solo oculta si no hay más operaciones en curso
   * 
   * Uso:
   * loadingService.hide();
   */
  hide() {
    this.operationCount = Math.max(0, this.operationCount - 1);
    
    // Solo ocultar si no hay más operaciones
    if (this.operationCount === 0) {
      this.isLoading.next(false);
    }
  }

  /**
   * Ejecuta una función asincrónica y muestra/oculta el loader automáticamente
   * 
   * Útil para API calls o cualquier operación async
   * 
   * Ejemplo:
   * await loadingService.withLoader(async () => {
   *   const response = await fetch('/api/users');
   *   return response.json();
   * });
   * 
   * @param {Function} asyncFn - Función asincrónica a ejecutar
   * @returns {Promise} - Resultado de la función
   */
  async withLoader(asyncFn) {
    try {
      this.show();
      return await asyncFn();
    } finally {
      this.hide();
    }
  }

  /**
   * Reinicia el estado del loader
   * Útil para debugging o en casos excepcionales
   */
  reset() {
    this.operationCount = 0;
    this.isLoading.next(false);
  }

  /**
   * Obtiene el estado actual del loader
   * @returns {boolean}
   */
  getIsLoading() {
    return this.isLoading.getValue();
  }
}

// Exportar instancia única (singleton)
export const loadingService = new LoadingService();
