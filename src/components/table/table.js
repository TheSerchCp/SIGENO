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
import { ReactivoBehavior } from '../../services/general/ReactivoBehavior.js';

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
      th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700';
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
      tr.className = 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';
      
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
    
    this.paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'px-3 py-2 mx-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
    prevBtn.textContent = '← Anterior';
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
    this.paginationContainer.appendChild(prevBtn);

    const info = document.createElement('span');
    info.className = 'mx-2 text-gray-700 dark:text-gray-300 text-sm';
    info.textContent = `Página ${this.currentPage} de ${totalPages}`;
    this.paginationContainer.appendChild(info);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'px-3 py-2 mx-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
    nextBtn.textContent = 'Siguiente →';
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
    this.paginationContainer.appendChild(nextBtn);
  }

  /**
   * Navega a una página específica
   */
  goToPage(pageNumber) {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    this.currentPage = pageNumber;
    this.renderRows();
    this.renderPagination();
    
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
