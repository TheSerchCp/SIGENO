import { BaseComponent } from '../../../services/general/BaseComponent.js';
import '/src/views/private/sharedComponents.js';

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
      { id: 9, nombre: 'Sergio Cortés', email: 'sergio.cortes@example.com', rol: 'admin', estado: 'activo' },
      { id: 10, nombre: 'Valentina Silva', email: 'valentina.silva@example.com', rol: 'usuario', estado: 'activo' },
      { id: 11, nombre: 'Roberto Díaz', email: 'roberto.diaz@example.com', rol: 'editor', estado: 'activo' },
      { id: 12, nombre: 'Isabel Flores', email: 'isabel.flores@example.com', rol: 'usuario', estado: 'inactivo' },
      { id: 13, nombre: 'Francisco Morales', email: 'francisco.morales@example.com', rol: 'admin', estado: 'activo' },
      { id: 14, nombre: 'Catalina Vargas', email: 'catalina.vargas@example.com', rol: 'usuario', estado: 'activo' },
      { id: 15, nombre: 'Andrés Reyes', email: 'andres.reyes@example.com', rol: 'editor', estado: 'activo' },
      { id: 16, nombre: 'Sofía Mendez', email: 'sofia.mendez@example.com', rol: 'usuario', estado: 'activo' },
      { id: 17, nombre: 'Miguel Ortiz', email: 'miguel.ortiz@example.com', rol: 'usuario', estado: 'inactivo' },
      { id: 18, nombre: 'Alejandra Romero', email: 'alejandra.romero@example.com', rol: 'admin', estado: 'activo' },
      { id: 19, nombre: 'Javier Herrera', email: 'javier.herrera@example.com', rol: 'editor', estado: 'activo' },
      { id: 20, nombre: 'Beatriz Castro', email: 'beatriz.castro@example.com', rol: 'usuario', estado: 'activo' },
      { id: 21, nombre: 'Manuel Gutierrez', email: 'manuel.gutierrez@example.com', rol: 'usuario', estado: 'activo' },
      { id: 22, nombre: 'Verónica Salazar', email: 'veronica.salazar@example.com', rol: 'admin', estado: 'inactivo' },
      { id: 23, nombre: 'Óscar Fuentes', email: 'oscar.fuentes@example.com', rol: 'editor', estado: 'activo' },
      { id: 24, nombre: 'Mariana Vega', email: 'mariana.vega@example.com', rol: 'usuario', estado: 'activo' },
      { id: 25, nombre: 'Gustavo Dominguez', email: 'gustavo.dominguez@example.com', rol: 'usuario', estado: 'activo' },
      { id: 26, nombre: 'Rosa Medina', email: 'rosa.medina@example.com', rol: 'admin', estado: 'activo' },
      { id: 27, nombre: 'Fernando Ibáñez', email: 'fernando.ibanez@example.com', rol: 'editor', estado: 'activo' },
      { id: 28, nombre: 'Cristina Nuñez', email: 'cristina.nunez@example.com', rol: 'usuario', estado: 'inactivo' },
      { id: 29, nombre: 'Esteban Molina', email: 'esteban.molina@example.com', rol: 'usuario', estado: 'activo' },
      { id: 30, nombre: 'Lorena Aguirre', email: 'lorena.aguirre@example.com', rol: 'admin', estado: 'activo' },
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
    console.log("Roles disponibles:", this.roles);
    const roleFilter = this.querySelector('#roleFilter');
    const searchInput = this.querySelector('#searchInput');
    const usersTable = this.querySelector('#usersTable');
    const filterInfo = this.querySelector('#filterInfo');

    // Configurar Select de Roles
    roleFilter.addEventListener('select-ready', () => {
      roleFilter.setOptions(this.roles, 'nombre', 'id');
    });

    // Configurar Tabla
    this.configureTable(usersTable, '');

    // Listener del Select - Cambiar rol y refilter
    roleFilter.addEventListener('select-change', (e) => {
      const selectedRole = e.detail.value;
      console.log("Rol seleccionado:", selectedRole);
      if(Array.isArray(selectedRole)) {
        console.log("Roles seleccionados (multiple):", selectedRole);
        //Filtrar tabla por múltiples roles
        usersTable.setRowValidator((row) => {
          return selectedRole.length === 0 || selectedRole.includes(row.rol);
        });
      }else{
        //Filtrar tabla por un solo rol
        usersTable.setRowValidator((row) => {
          return !selectedRole || row.rol === selectedRole;
        });
      }
      // // Actualizar rol de la tabla
      // usersTable.setRole(selectedRole || 'usuario');
      
      // // Aplicar validador por rol
      // usersTable.setRowValidator((row, role) => {
      //   // Si se selecciona un rol específico, mostrar solo esos usuarios
      //   if (selectedRole && role !== 'usuario') {
      //     return row.rol === role;
      //   }
      //   return true;
      // });

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
      pageSize: 10,
      role: 'usuario',
      rowValidator: () => true
    });
  }

  updateFilterInfo(table, searchTerm) {
    const filterInfoContainer = table.querySelector('#filter-info-container');
    const totalRows = table.getTotalRows();
    const startIndex = (table.currentPage - 1) * table.pageSize + 1;
    const endIndex = Math.min(table.currentPage * table.pageSize, totalRows);
    
    let info = `Mostrando ${startIndex} a ${endIndex} de ${totalRows} usuario${totalRows !== 1 ? 's' : ''}`;
    
    if (filterInfoContainer) {
      filterInfoContainer.textContent = info;
    }
  }
}

customElements.define('users-component', UsersComponent);

