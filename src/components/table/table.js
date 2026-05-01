/**
 * TABLE COMPONENT - Componente tabla reutilizable con paginación y ReactivoBehavior
 * 
 * Propósito:
 * - Mostrar datos tabulares con columnas configurables
 * - Paginación automática según pageSize
 * - Validaciones por rol para mostrar/ocultar datos
 * - Filtrado y ordenamiento flexible
 * - Rerender automático usando ReactivoBehavior
 * 
 * Ejemplo:
 * const table = document.getElementById('usersTable');
 * table.setConfig({
 *   columns: [
 *     { key: 'id', label: 'ID', width: '80px' },
 *     { key: 'name', label: 'Nombre' },
 *     { key: 'email', label: 'Email' },
 *     { key: 'role', label: 'Rol' }
 *   ],
 *   data: users,
 *   pageSize: 10,
 *   role: 'admin',
 *   rowValidator: (row, role) => {
 *     if (role === 'user') return row.visible === true;
 *     return true;
 *   }
 * });
 * 
 * table.onSearchChange(searchTerm => {
 *   console.log('Búsqueda:', searchTerm);
 * });
 */

import { BaseComponent } from '../../services/general/BaseComponent.js';
import { ReactivoBehavior } from '../../services/general/ReactiveBehavior.js';

export class TableComponent extends BaseComponent {
  constructor() {
    super();
    this.columns = [];
    this.data = [];
    this.pageSize = 10;
    this.currentPage = 1;
    this.role = 'user';
    this.rowValidator = null;
    this.filteredData = [];
    this.searchTerm$ = new ReactivoBehavior('');
    this.currentPage$ = new ReactivoBehavior(1);
    this.searchCallback = null;
  }

  async connectedCallback() {
    await this.loadTemplate('/src/components/table/table.html', '#table-template');
    this.cacheDom();
    
    // Suscribirse a cambios de búsqueda
    this.searchTerm$.subscribe((term) => {
      this.currentPage = 1;
      this.applyFilters();
      this.render();
      
      if (this.searchCallback) {
        this.searchCallback(term);
      }
    });

    // Suscribirse a cambios de página
    this.currentPage$.subscribe((page) => {
      this.currentPage = page;
      this.render();
    });
  }

  cacheDom() {
    this.tbody = this.querySelector('tbody');
    this.paginationContainer = this.querySelector('.pagination-container');
    this.filterInfoContainer = this.querySelector('#filter-info-container');
    this.thead = this.querySelector('thead tr');
  }

  /**
   * Suscribirse a cambios de búsqueda
   */
  onSearchChange(callback) {
    this.searchCallback = callback;
  }

  /**
   * Método para actualizar el término de búsqueda desde el input
   */
  setSearch(term) {
    this.searchTerm$.next(term);
  }

  /**
   * Obtener el término de búsqueda actual
   */
  getSearchTerm() {
    return this.searchTerm$.getValue();
  }

  /**
   * Configura la tabla completa
   */
  setConfig(config) {
    this.columns = config.columns || [];
    this.data = config.data || [];
    this.pageSize = config.pageSize || 10;
    this.role = config.role || 'user';
    this.rowValidator = config.rowValidator || (() => true);
    this.currentPage = 1;
    
    this.applyFilters();
    this.render();
  }

  /**
   * Aplica validaciones y filtros a los datos
   */
  applyFilters() {
    let filtered = this.data.filter(row => {
      return this.rowValidator(row, this.role);
    });

    // Aplicar búsqueda si hay término
    const searchTerm = this.searchTerm$.getValue();
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(row => {
        return this.columns.some(column => {
          const cellValue = String(row[column.key] ?? '').toLowerCase();
          return cellValue.includes(term);
        });
      });
    }

    this.filteredData = filtered;
  }

  /**
   * Renderiza la tabla completa
   */
  render() {
    this.renderHeaders();
    this.renderRows();
    this.renderPagination();
  }

  /**
   * Renderiza los headers de la tabla
   */
  renderHeaders() {
    if (!this.thead) return;
    
    this.thead.innerHTML = '';
    
    this.columns.forEach(column => {
      const th = document.createElement('th');
      th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-[#0A102F] p-4 rounded-md border-b-1 border-[#181F3D]';
      if (column.width) {
        th.style.width = column.width;
      }
      th.textContent = column.label;
      this.thead.appendChild(th);
    });
  }

  /**
   * Renderiza las filas de datos de la página actual
   */
  renderRows() {
    if (!this.tbody) return;
    
    this.tbody.innerHTML = '';
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const pageData = this.filteredData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.className = 'px-6 py-4 text-center text-gray-500 dark:text-gray-400';
      td.colSpan = this.columns.length;
      td.textContent = 'No hay datos para mostrar';
      tr.appendChild(td);
      this.tbody.appendChild(tr);
      return;
    }

    pageData.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-gray-200 dark:border-[#181F3D] hover:bg-gray-50/40 dark:hover:bg-gray-800/50 transition-colors';
      
      this.columns.forEach(column => {
        const td = document.createElement('td');
        td.className = 'px-6 py-4 text-sm text-gray-900 dark:text-gray-100';
        
        const cellValue = row[column.key];
        
        if (column.render && typeof column.render === 'function') {
          td.innerHTML = column.render(cellValue, row, column);
        } else {
          td.textContent = cellValue ?? '-';
        }
        
        tr.appendChild(td);
      });
      
      this.tbody.appendChild(tr);
    });
  }

  /**
   * Renderiza los controles de paginación
   */
  renderPagination() {
    if (!this.paginationContainer) return;
    
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize + 1;
    const endIndex = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
    
    this.paginationContainer.innerHTML = '';

    if (totalPages <= 1) {
      if (this.filterInfoContainer) {
        this.filterInfoContainer.textContent = `Mostrando ${this.filteredData.length} de ${this.filteredData.length} registros`;
      }
      return;
    }

    // Actualizar información de filtrado en la izquierda
    if (this.filterInfoContainer) {
      this.filterInfoContainer.textContent = `Mostrando ${startIndex} a ${endIndex} de ${this.filteredData.length} registros`;
    }

    // Botón Anterior (flecha)
    const prevBtn = this.createPaginationButton('←', this.currentPage === 1);
    prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
    });
    this.paginationContainer.appendChild(prevBtn);

    // Generar botones de página
    const pageButtons = this.generatePageButtons(totalPages);
    pageButtons.forEach(btn => {
      this.paginationContainer.appendChild(btn);
    });

    // Botón Siguiente (flecha)
    const nextBtn = this.createPaginationButton('→', this.currentPage === totalPages);
    nextBtn.addEventListener('click', () => {
      if (this.currentPage < totalPages) this.goToPage(this.currentPage + 1);
    });
    this.paginationContainer.appendChild(nextBtn);
  }

  /**
   * Crea un botón de paginación con estilos
   */
  createPaginationButton(text, isDisabled, isActive = false) {
    const btn = document.createElement('button');
    
    const baseClasses = 'px-2 py-1 border border-[#181F3D] rounded-md transition-colors';
    const activeClasses = isActive ? 'bg-[#1C42D9] text-white' : 'bg-transparent text-gray-400 hover:text-white';
    const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    btn.className = `${baseClasses} ${activeClasses} ${disabledClasses}`;
    btn.textContent = text;
    btn.disabled = isDisabled;
    
    return btn;
  }

  /**
   * Genera los botones de páginas con lógica de ellipsis
   */
  generatePageButtons(totalPages) {
    const buttons = [];
    let pagesToShow = [];

    if (totalPages <= 5) {
      // Mostrar todas las páginas si hay 5 o menos
      for (let i = 1; i <= totalPages; i++) {
        pagesToShow.push(i);
      }
    } else {
      // Mostrar 3 números + ellipsis + última página
      if (this.currentPage <= 3) {
        // Inicio: [1][2][3]...[N]
        pagesToShow = [1, 2, 3, '...', totalPages];
      } else if (this.currentPage >= totalPages - 2) {
        // Fin: [1]...[N-2][N-1][N]
        pagesToShow = [1, '...', totalPages - 2, totalPages - 1, totalPages];
      } else {
        // Medio: [1]...[current-1][current][current+1]...[N]
        pagesToShow = [1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', totalPages];
      }
    }

    pagesToShow.forEach(page => {
      if (page === '...') {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'px-2 py-2 text-gray-400';
        ellipsis.textContent = '...';
        buttons.push(ellipsis);
      } else {
        const btn = this.createPaginationButton(String(page), false, page === this.currentPage);
        btn.addEventListener('click', () => this.goToPage(page));
        buttons.push(btn);
      }
    });

    return buttons;
  }

  /**
   * Navega a una página específica
   */
  goToPage(pageNumber) {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    this.currentPage = pageNumber;
    this.render();
    
    this.emit('page-change', { page: this.currentPage, totalPages });
  }

  /**
   * Obtiene los datos de la página actual
   */
  getCurrentPageData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredData.slice(startIndex, endIndex);
  }

  /**
   * Obtiene el total de páginas
   */
  getTotalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  /**
   * Obtiene el total de filas después de filtrar
   */
  getTotalRows() {
    return this.filteredData.length;
  }

  /**
   * Actualiza los datos
   */
  updateData(newData) {
    this.data = newData || [];
    this.currentPage = 1;
    this.applyFilters();
    this.render();
  }

  /**
   * Actualiza el validador de filas
   */
  setRowValidator(validator) {
    this.rowValidator = validator;
    this.currentPage = 1;
    this.applyFilters();
    this.render();
  }

  /**
   * Cambia el rol
   */
  setRole(role) {
    this.role = role;
    this.currentPage = 1;
    this.applyFilters();
    this.render();
  }

  /**
   * Ordena por columna
   */
  sortBy(key, ascending = true) {
    this.filteredData.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });
    
    this.currentPage = 1;
    this.render();
  }
}

customElements.define('table-component', TableComponent);
