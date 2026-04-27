/**
  MODAL SERVICE - Servicio global para controlar modales
  
  Propósito:
  - Mostrar/ocultar modales desde cualquier parte de la aplicación
  - Personalizar título, mensaje, icono
  - Ejecutar callbacks al confirmar
  - Permitir botones personalizados
  
  Uso:
  import { modalService } from './modal.service.js';
  
  // Modal simple
  modalService.show({
    title: 'Confirmar',
    message: '¿Deseas continuar?',
    icon: '⚠',
   onConfirm: () => { console.log('Confirmado'); }
  });
  
  // Con texto personalizado en botón
  modalService.show({
    title: 'Eliminar',
    message: '¿Eliminar este elemento?',
    icon: '🗑️',
   confirmText: 'Eliminar',
    onConfirm: () => { /* ejecutar eliminación  }  });
  
  // Cerrar modal
  modalService.close();
 */

import { ReactivoBehavior } from './ReactiveBehavior.js';

class ModalService {
  constructor() {
    // Estado reactivo del modal
    this.modalState = new ReactivoBehavior({
      isOpen: false,
      title: '',
      message: '',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      showDefaultButtons: true,
      customButtons: null,
      onConfirm: null
    });
  }

  /**
   * Muestra un modal
   * @param {Object} options - Configuración del modal
   * @param {string} options.title - Título del modal
   * @param {string} options.message - Mensaje/contenido principal
   * @param {string} options.confirmText - Texto del botón confirmar (default: 'Confirmar')
   * @param {string} options.cancelText - Texto del botón cancelar (default: 'Cancelar')
   * @param {Function} options.onConfirm - Función a ejecutar al confirmar
   * @param {boolean} options.showDefaultButtons - Mostrar botones por defecto (default: true)
   * @param {string} options.customButtons - HTML para botones personalizados
   */
  show(options = {}) {
    const newState = {
      isOpen: true,
      title: options.title || '',
      message: options.message || '',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      showDefaultButtons: options.showDefaultButtons !== false,
      customButtons: options.customButtons || null,
      onConfirm: options.onConfirm || null
    };

    this.modalState.next(newState);
    console.log('📋 Modal abierto:', options.title);
  }

  /**
   * Cierra el modal
   */
  close() {
    this.modalState.next({
      ...this.modalState.getValue(),
      isOpen: false
    });
    console.log('📋 Modal cerrado');
  }

  /**
   * Muestra un modal de confirmación simple
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje
   * @param {Function} onConfirm - Función al confirmar
   */
  confirm(title, message, onConfirm) {
    this.show({
      title,
      message,
      confirmText: 'Confirmar',
      onConfirm
    });
  }

  /**
   * Muestra un modal de eliminación
   * @param {string} itemName - Nombre del elemento a eliminar
   * @param {Function} onConfirm - Función al confirmar eliminación
   */
  delete(itemName, onConfirm) {
    this.show({
      title: 'Eliminar',
      message: `¿Estás seguro de que deseas eliminar "${itemName}"?`,
      confirmText: 'Eliminar',
      onConfirm
    });
  }

  /**
   * Muestra un modal de información
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje
   */
  info(title, message) {
    this.show({
      title,
      message,
      confirmText: 'Aceptar'
    });
  }

  /**
   * Muestra un modal de advertencia
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje
   * @param {Function} onConfirm - Función al confirmar
   */
  warning(title, message, onConfirm) {
    this.show({
      title,
      message,
      confirmText: 'Continuar',
      onConfirm
    });
  }

  /**
   * Muestra un modal de error
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje
   */
  error(title, message) {
    this.show({
      title,
      message,
      confirmText: 'Aceptar'
    });
  }

  /**
   * Obtiene el estado actual del modal
   * @returns {Object}
   */
  getState() {
    return this.modalState.getValue();
  }

  /**
   * Verifica si el modal está abierto
   * @returns {boolean}
   */
  isOpen() {
    return this.modalState.getValue().isOpen;
  }
}

// Exportar instancia única (singleton)
export const modalService = new ModalService();
