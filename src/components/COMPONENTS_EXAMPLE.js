/**
 * EJEMPLO DE USO - Select y Table Components
 * 
 * Este archivo muestra cómo usar los componentes Select y Table
 */

// ========================================
// 1. SELECT COMPONENT - EJEMPLO DE USO
// ========================================

// HTML:
// <select-component id="roleSelect" placeholder="Selecciona un rol"></select-component>

// JavaScript:
const roleSelect = document.getElementById('roleSelect');

const roles = [
  { id: 1, name: 'Admin', permissions: 'full' },
  { id: 2, name: 'Editor', permissions: 'write' },
  { id: 3, name: 'Viewer', permissions: 'read' }
];

// Configurar opciones: array, propiedad a mostrar, propiedad para valor
roleSelect.setOptions(roles, 'name', 'id');

// Escuchar cambios
roleSelect.addEventListener('select-change', (e) => {
  console.log('Valor:', e.detail.value);        // 1, 2 o 3
  console.log('Datos completos:', e.detail.data); // { id: 1, name: 'Admin', ... }
  console.log('Texto:', e.detail.displayText);   // 'Admin', 'Editor', etc
});

// Métodos disponibles:
// roleSelect.getValue()      - Obtiene el valor seleccionado
// roleSelect.getData()       - Obtiene el objeto completo
// roleSelect.setValue(value) - Establece un valor
// roleSelect.reset()         - Resetea al placeholder
// roleSelect.setDisabled(true/false) - Habilita/deshabilita


// ========================================
// 2. TABLE COMPONENT - EJEMPLO DE USO
// ========================================

// HTML:
// <table-component id="usersTable"></table-component>

// JavaScript:
const usersTable = document.getElementById('usersTable');

const users = [
  { id: 1, name: 'Juan', email: 'juan@example.com', role: 'admin', status: 'active', department: 'IT' },
  { id: 2, name: 'María', email: 'maria@example.com', role: 'editor', status: 'active', department: 'Marketing' },
  { id: 3, name: 'Pedro', email: 'pedro@example.com', role: 'user', status: 'inactive', department: 'Sales' },
  { id: 4, name: 'Ana', email: 'ana@example.com', role: 'admin', status: 'active', department: 'HR' },
  { id: 5, name: 'Luis', email: 'luis@example.com', role: 'user', status: 'active', department: 'IT' }
];

// Configurar tabla con validador por rol
usersTable.setConfig({
  columns: [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Nombre', width: '150px' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Rol',
      render: (value) => {
        const colors = {
          admin: 'bg-red-100 text-red-800',
          editor: 'bg-blue-100 text-blue-800',
          user: 'bg-gray-100 text-gray-800'
        };
        return `<span class="px-2 py-1 rounded text-xs font-semibold ${colors[value] || ''}">${value}</span>`;
      }
    },
    { 
      key: 'status', 
      label: 'Estado',
      render: (value) => {
        const icon = value === 'active' ? '✅' : '⏸️';
        return `${icon} ${value}`;
      }
    },
    { key: 'department', label: 'Departamento' }
  ],
  data: users,
  pageSize: 3,
  role: 'admin',
  rowValidator: (row, role) => {
    // Si el rol es 'user', no mostrar admins
    if (role === 'user') {
      return row.role !== 'admin';
    }
    // Admins ven todo
    return true;
  }
});

// Escuchar cambios de página
usersTable.addEventListener('page-change', (e) => {
  console.log(`Página ${e.detail.page} de ${e.detail.totalPages}`);
});

// Métodos disponibles:
// usersTable.getCurrentPageData()    - Obtiene datos de la página actual
// usersTable.getTotalPages()         - Total de páginas
// usersTable.getTotalRows()          - Total de filas filtradas
// usersTable.updateData(newData)     - Actualiza solo los datos
// usersTable.setRole('user')         - Cambia el rol y refiltra
// usersTable.setRowValidator(fn)     - Actualiza validador
// usersTable.sortBy('name', true)    - Ordena por columna
// usersTable.goToPage(2)             - Va a página específica


// ========================================
// 3. EJEMPLO COMPLETO - FILTRADO POR ROL
// ========================================

function updateTableByRole(selectedRole) {
  usersTable.setRole(selectedRole);
  
  // Actualizar validador según lógica de negocio
  if (selectedRole === 'user') {
    usersTable.setRowValidator((row, role) => {
      // Users solo ven usuarios activos que no sean admins
      return row.status === 'active' && row.role !== 'admin';
    });
  } else if (selectedRole === 'editor') {
    usersTable.setRowValidator((row, role) => {
      // Editors ven todo menos otros editors en IT
      return !(row.role === 'editor' && row.department === 'IT');
    });
  } else {
    // Admin ve todo
    usersTable.setRowValidator(() => true);
  }
}

// Usar con select
roleSelect.addEventListener('select-change', (e) => {
  updateTableByRole(e.detail.value);
});


// ========================================
// 4. EJEMPLO - SELECT SIN VALOR DEFINIDO
// ========================================

const departmentSelect = document.getElementById('departmentSelect');

const departments = [
  { code: 'IT', fullName: 'Information Technology' },
  { code: 'HR', fullName: 'Human Resources' },
  { code: 'SALES', fullName: 'Sales' }
];

// Si no pasas valueProp, devuelve el objeto completo
departmentSelect.setOptions(departments, 'fullName'); // sin valueProp

departmentSelect.addEventListener('select-change', (e) => {
  console.log(e.detail.value); // { code: 'IT', fullName: 'Information Technology' }
});
