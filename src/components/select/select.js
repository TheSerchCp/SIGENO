/**
 * SELECT COMPONENT - Componente select reutilizable con ReactivoBehavior
 * 
 * Propósito:
 * - Mostrar opciones dinámicas basadas en un array de objetos
 * - Permitir configuración flexible de propiedades a mostrar y valores
 * - Emitir eventos con los valores seleccionados usando ReactivoBehavior
 * - Rerender automáticamente cuando cambian opciones
 * 
 * Parámetros:
 * @param {Array} options - Array de objetos con las opciones
 * @param {string} displayProp - Propiedad del objeto a mostrar como texto
 * @param {string} valueProp - Propiedad del objeto a usar como valor (opcional)
 * @param {string} placeholder - Texto del placeholder
 * 
 * Ejemplo:
 * <select-component id="userSelect" placeholder="Selecciona un usuario"></select-component>
 * 
 * const selectElem = document.getElementById('userSelect');
 * selectElem.setOptions([
 *   { id: 1, name: 'Juan' },
 *   { id: 2, name: 'María' }
 * ], 'name', 'id');
 * 
 * selectElem.onChange(({ value, data, displayText }) => {
 *   console.log('Valor:', value);  // 1 o 2
 *   console.log('Datos:', data);   // { id: 1, name: 'Juan' }
 * });
 */

import { BaseComponent } from '../../services/general/BaseComponent.js';
import { ReactivoBehavior } from '../../services/general/ReactivoBehavior.js';

export class SelectComponent extends BaseComponent {
  constructor() {
    super();
    this.options = [];
    this.displayProp = 'name';
    this.valueProp = null;
    this.selectedValue$ = new ReactivoBehavior(null);
    this.selectedData$ = new ReactivoBehavior(null);
  }

  async connectedCallback() {
    await this.loadTemplate('/src/components/select/select.html', '#select-template');
    this.cacheDom();
    this.readAttributes();
    this.setupEventListeners();
  }

  cacheDom() {
    this.selectElement = this.querySelector('select');
  }

  readAttributes() {
    const placeholder = this.getAttribute('placeholder') || 'Selecciona una opción';
    const disabled = this.hasAttribute('disabled');
    
    if (this.selectElement) {
      this.selectElement.disabled = disabled;
      if (placeholder) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = placeholder;
        option.disabled = true;
        option.selected = true;
        this.selectElement.appendChild(option);
      }
    }
  }

  setupEventListeners() {
    if (this.selectElement) {
      this.selectElement.addEventListener('change', (e) => {
        this.handleChange(e);
      });
    }
  }

  /**
   * Configura las opciones del select
   */
  setOptions(options = [], displayProp = 'name', valueProp = null) {
    this.options = Array.isArray(options) ? options : [];
    this.displayProp = displayProp;
    this.valueProp = valueProp;
    this.renderOptions();
  }

  /**
   * Renderiza las opciones en el select
   */
  renderOptions() {
    if (!this.selectElement) return;

    // Limpiar opciones (excepto placeholder)
    while (this.selectElement.options.length > 1) {
      this.selectElement.remove(1);
    }

    // Agregar opciones
    this.options.forEach((option, index) => {
      const optElement = document.createElement('option');
      optElement.value = this.valueProp ? option[this.valueProp] : index;
      optElement.textContent = option[this.displayProp] || JSON.stringify(option);
      optElement.dataset.index = index;
      this.selectElement.appendChild(optElement);
    });
  }

  /**
   * Maneja el cambio de selección
   */
  handleChange(event) {
    const selectedIndex = event.target.selectedIndex;
    
    if (selectedIndex <= 0) {
      this.selectedValue$.next(null);
      this.selectedData$.next(null);
      return;
    }

    const optionIndex = parseInt(event.target.options[selectedIndex].dataset.index);
    const selectedData = this.options[optionIndex];
    const selectedValue = this.valueProp 
      ? selectedData[this.valueProp] 
      : selectedData;

    this.selectedData$.next(selectedData);
    this.selectedValue$.next(selectedValue);

    this.emit('select-change', {
      value: selectedValue,
      data: selectedData,
      displayText: event.target.options[selectedIndex].textContent
    });
  }

  /**
   * Suscribirse a cambios de valor
   */
  onChange(callback) {
    this.selectedValue$.subscribe(callback);
  }

  /**
   * Suscribirse a cambios de datos
   */
  onDataChange(callback) {
    this.selectedData$.subscribe(callback);
  }

  getValue() {
    return this.selectedValue$.getValue();
  }

  getData() {
    return this.selectedData$.getValue();
  }

  setValue(value) {
    if (!this.selectElement) return;
    const option = this.selectElement.querySelector(`option[value="${value}"]`);
    if (option) {
      this.selectElement.value = value;
      this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  reset() {
    if (this.selectElement) {
      this.selectElement.selectedIndex = 0;
      this.selectedValue$.next(null);
      this.selectedData$.next(null);
    }
  }

  setDisabled(disabled) {
    if (this.selectElement) {
      this.selectElement.disabled = disabled;
    }
  }
}

customElements.define('select-component', SelectComponent);
