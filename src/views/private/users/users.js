import { BaseComponent } from '../../../services/general/BaseComponent.js';

// Importar componentes
import '/src/components/select/select.js';
import '/src/components/table/table.js';
import '/src/components/input/input.js';

class UsersComponent extends BaseComponent {
  constructor() {
    super();
    this.users = [
      { id: 1, nombre: 'Juan González', email: 'juan.gonzalez@example.com', rol: 'admin', estado: 'activo' },
      { id: 2, nombre: 'María Rodríguez', email: 'maria.rodriguez@example.com', rol: 'usuario', estado: 'activo' },
      { id: 3, nombre: 'Pedro López', email: 'pedro.lopez@example.com', rol: 'editor', estado: 'inactivo' },
      { id: 4, nombre: 'Ana Martínez', email: 'ana.martinez@example.com', rol: 'usuario', estado: 'activo' },
      { id: 5, nombre: 'Carlos García', email: 'carlos.garcia@example.com', rol: 'admin', estado: 'activo' },
      { id: 6, nombre: 'Laura Sánchez', email: 'laura.sanchez@example.com', rol: 'editor', estado: 'activo' },
      { id: 7, nombre: 'David Torres', email: 'david.torres@example.com', rol: 'usuario', estado: 'inactivo' },
      { id: 8, nombre: 'Emma Pérez', email: 'emma.perez@example.com', rol: 'usuario', estado: 'activo' },
    ];

    this.roles = [
      { id: 'admin', nombre: 'Administrador' },
      { id: 'editor', nombre: 'Editor' },
      { id: 'usuario', nombre: 'Usuario' }
    ];
  }

  async connectedCallback() {
    await this.loadTemplate('/src/views/private/users/users.html', '#users-template');
    this.setupComponents();
  }

  setupComponents() {
    const roleFilter = this.querySelector('#roleFilter');
    const searchInput = this.querySelector('#searchInput');
    const usersTable = this.querySelector('#usersTable');
    const filterInfo = this.querySelector('#filterInfo');

    // Configurar Select de Roles
    roleFilter.setOptions(this.roles, 'nombre', 'id');

    // Configurar Tabla
    this.configureTable(usersTable, '');

    // Listener del Select - Cambiar rol y refilter
    roleFilter.addEventListener('select-change', (e) => {
      const selectedRole = e.detail.value;
      
      // Actualizar rol de la tabla
      usersTable.setRole(selectedRole || 'usuario');
      
      // Aplicar validador por rol
      usersTable.setRowValidator((row, role) => {
        // Si se selecciona un rol específico, mostrar solo esos usuarios
        if (selectedRole && role !== 'usuario') {
          return row.rol === role;
        }
        return true;
      });

      this.updateFilterInfo(usersTable, searchInput.getValue());
    });

    // Listener del Input de búsqueda - Filtrar tabla reactivamente
    searchInput.value$.subscribe((searchTerm) => {
      usersTable.setSearch(searchTerm);
      this.updateFilterInfo(usersTable, searchTerm);
    });

    // Listener de cambios en la tabla (búsqueda reactiva)
    usersTable.onSearchChange((term) => {
      this.updateFilterInfo(usersTable, term);
    });
  }

  configureTable(table, searchTerm) {
    table.setConfig({
      columns: [
        { 
          key: 'id', 
          label: 'ID', 
          width: '60px',
          render: (value) => `<span class="font-mono text-sm">#${value}</span>`
        },
        { 
          key: 'nombre', 
          label: 'Nombre',
          render: (value) => `<span class="font-medium">${value}</span>`
        },
        { 
          key: 'email', 
          label: 'Email',
          render: (value) => `<a href="mailto:${value}" class="text-blue-600 dark:text-blue-400 hover:underline">${value}</a>`
        },
        { 
          key: 'rol', 
          label: 'Rol',
          render: (value) => {
            const colores = {
              admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
              usuario: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            };
            return `<span class="px-3 py-1 rounded-full text-sm font-medium ${colores[value] || 'bg-gray-100 text-gray-800'}">${value}</span>`;
          }
        },
        { 
          key: 'estado', 
          label: 'Estado',
          render: (value) => {
            const icon = value === 'activo' ? '✅' : '❌';
            const color = value === 'activo' 
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400';
            return `<span class="${color}">${icon} ${value}</span>`;
          }
        }
      ],
      data: this.users,
      pageSize: 5,
      role: 'usuario',
      rowValidator: () => true
    });
  }

  updateFilterInfo(table, searchTerm) {
    const filterInfo = this.querySelector('#filterInfo');
    const totalRows = table.getTotalRows();
    const totalPages = table.getTotalPages();
    
    let info = `Mostrando ${totalRows} usuario${totalRows !== 1 ? 's' : ''}`;
    if (searchTerm) {
      info += ` (búsqueda: "${searchTerm}")`;
    }
    if (totalPages > 1) {
      info += ` en ${totalPages} página${totalPages !== 1 ? 's' : ''}`;
    }
    
    filterInfo.textContent = info;
  }
}

customElements.define('users-component', UsersComponent);

