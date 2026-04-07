/**
 * EJEMPLOS DE USO DEL MODAL SERVICE
 * 
 * El modalService proporciona una forma simple de mostrar modales 
 * personalizables desde cualquier parte de la aplicación.
 */

import { modalService } from './modal.service.js';

// ============================================
// 1. MODAL SIMPLE DE CONFIRMACIÓN
// ============================================
modalService.show({
  title: 'Confirmar acción',
  message: '¿Deseas continuar?',
  icon: '⚠️',
  confirmText: 'Continuar',
  onConfirm: () => {
    console.log('Usuario confirmó');
  }
});

// ============================================
// 2. MODAL DE ELIMINACIÓN
// ============================================
modalService.delete('elemento', () => {
  console.log('Elemento eliminado');
  // Ejecutar lógica de eliminación aquí
});

// ============================================
// 3. MODAL DE INFORMACIÓN
// ============================================
modalService.info('Información', 'Esta es una notificación informativa');

// ============================================
// 4. MODAL DE ADVERTENCIA
// ============================================
modalService.warning(
  'Advertencia',
  'Esta acción no se puede deshacer',
  () => {
    console.log('Usuario aceptó la advertencia');
  }
);

// ============================================
// 5. MODAL DE ERROR
// ============================================
modalService.error('Error', 'Ha ocurrido un error inesperado');

// ============================================
// 6. MODAL CON CONFIRMACIÓN SIMPLE
// ============================================
modalService.confirm(
  'Cerrar sesión',
  '¿Estás seguro de que deseas cerrar sesión?',
  () => {
    localStorage.clear();
    window.location.href = '/login';
  },
  '👋'
);

// ============================================
// 7. CERRAR MODAL PROGRAMÁTICAMENTE
// ============================================
modalService.close();

// ============================================
// 8. VERIFICAR SI EL MODAL ESTÁ ABIERTO
// ============================================
if (modalService.isOpen()) {
  console.log('El modal está abierto');
}

// ============================================
// 9. OBTENER ESTADO ACTUAL DEL MODAL
// ============================================
const state = modalService.getState();
console.log('Estado del modal:', state);

// ============================================
// EN COMPONENTES (EJEMPLO):
// ============================================
// import { modalService } from '../services/general/modal.service.js';
//
// class MiComponente extends BaseComponent {
//   handleDelete() {
//     modalService.delete('usuario', () => {
//       // Lógica de eliminación
//       this.deleteUser();
//     });
//   }
//
//   handleLogout() {
//     modalService.show({
//       title: 'Cerrar sesión',
//       message: '¿Deseas cerrar sesión?',
//       icon: '👋',
//       confirmText: 'Cerrar sesión',
//       onConfirm: () => {
//         localStorage.clear();
//         window.location.href = '/login';
//       }
//     });
//   }
// }
