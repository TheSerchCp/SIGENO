/**
 * SHARED COMPONENTS - Importa todos los componentes necesarios para vistas privadas
 * 
 * Este archivo se debe importar en cada vista privada (home, users, etc)
 * para que los Web Components estén disponibles
 * 
 * Uso:
 * import '../sharedComponents.js';
 */

// Componentes Core
import '/src/components/form/form.js';
import '/src/components/input/input.js';
import '/src/components/button/button.js';
import '/src/components/loader/loader.js';

// Componentes de Data Display
import '/src/components/select/select.js';
import '/src/components/table/table.js';

console.log('✓ Componentes compartidos (privados) cargados: form, input, button, loader, select, table');

