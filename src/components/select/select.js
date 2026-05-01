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
import { ReactivoBehavior } from '../../services/general/ReactiveBehavior.js';

export class SelectComponent extends BaseComponent {
  constructor() {
    super();
    this.options = [];
    this.displayProp = 'name';
    this.valueProp = null;
    this.selectedValue$ = new ReactivoBehavior(null);
    this.selectedData$ = new ReactivoBehavior(null);
    this.placeholder = 'Selecciona una opción';
    this.isMultiple = false;
    this.selectedValues = new Set();
    this.selectedItems = new Map(); // index -> data
  }

  async connectedCallback() {
    await this.loadTemplate('/src/components/select/select.html', '#select-template');
    this.cacheDom();
    this.readAttributes();
    this.setupEvents();

    this.emit('select-ready'); //Informar que el select está listo para recibir opciones o eventos
  }

  cacheDom() {
    this.trigger = this.querySelector('#trigger');
    this.dropdown = this.querySelector('#dropdown');
    this.optionsContainer = this.querySelector('#options-container');
    this.selectedText = this.querySelector('#selected-text');
    this.arrow = this.querySelector('#arrow');
    this.clearBtn = this.querySelector('#clear-btn');
  }

  readAttributes() {
    this.isMultiple = this.hasAttribute('multiple');
    this.placeholder = this.getAttribute('placeholder') || this.placeholder;
    const label = this.getAttribute('label') || '';

    if (label) {
      this.querySelector('#label').textContent = label;
    }

    this.selectedText.textContent = this.placeholder;
  }

  setupEvents() {
    // Toggle dropdown
    this.trigger.addEventListener('click', () => {
      this.dropdown.classList.toggle('hidden');
      this.arrow.classList.toggle('rotate-180');
    });

    // Click fuera
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        this.close();
      }
    });

    // Clear button
    this.clearBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // ❌ evita abrir el dropdown
      this.reset(true);    // 🔥 reset con emisión
    });
  }

  open() {
    this.dropdown.classList.remove('hidden');
    this.arrow.classList.add('rotate-180');
  }

  close() {
    this.dropdown.classList.add('hidden');
    this.arrow.classList.remove('rotate-180');
  }

  toggleOption(index, data, value, text, li) {
  const checkbox = li.querySelector('input');
  const icon = li.querySelector('.check-icon');
  if(!checkbox) return;

  const isSelected = this.selectedValues.has(value);

  if (isSelected) {
    this.selectedValues.delete(value);
    this.selectedItems.delete(index);
    li.classList.remove('bg-[#1A2340]', 'text-white');
    icon.classList.add('opacity-0');
    checkbox.checked = false;
  } else {
    this.selectedValues.add(value);
    this.selectedItems.set(index, data);
    li.classList.add('bg-[#1A2340]', 'text-white');
    icon.classList.remove('opacity-0');
    checkbox.checked = true;
  }

  this.updateMultiUI();
}

  /**
   * 🔥 API ORIGINAL (SE MANTIENE)
   */
  setOptions(options = [], displayProp = 'name', valueProp = null) {
    this.options = Array.isArray(options) ? options : [];
    this.displayProp = displayProp;
    this.valueProp = valueProp;
    this.renderOptions();
  }

  /**
   * 🔥 Render custom (aquí está la magia)
   */
  renderOptions() {
    if (!this.optionsContainer) return;

    this.optionsContainer.innerHTML = '';

    // // Placeholder option
    // const placeholderItem = this.createOptionItem({
    //   text: this.placeholder,
    //   value: null,
    //   index: -1
    // }, true);

    // this.optionsContainer.appendChild(placeholderItem);

    // Opciones reales
    this.options.forEach((option, index) => {
      const text = option[this.displayProp] || JSON.stringify(option);
      const value = this.valueProp ? option[this.valueProp] : option;

      const item = this.createOptionItem({
        text,
        value,
        index,
        data: option
      });

      this.optionsContainer.appendChild(item);
    });
  }

createOptionItem({ text, value, index, data }) {
  const li = document.createElement('li');

  li.className = `
    px-4 py-2 cursor-pointer flex items-center justify-between
    hover:bg-[#1A2340] transition-all
  `;

  li.dataset.index = index;

  // 🔥 CONTENIDO
  if (this.isMultiple) {
li.innerHTML = `
  <div class="flex items-center gap-2">
    
    <div class="relative flex items-center">
      
      <input type="checkbox"
        class="peer h-5 w-5 appearance-none rounded-md border border-slate-300 
               checked:bg-blue-500 checked:border-[#7895ff] 
               pointer-events-none">

      <span class="check-icon absolute inset-0 flex items-center justify-center 
             text-white opacity-0">
        <svg xmlns="http://www.w3.org/2000/svg"
             class="h-3.5 w-3.5"
             viewBox="0 0 20 20"
             fill="currentColor">
          <path fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"/>
        </svg>
      </span>

    </div>

    <span>${text}</span>
  </div>
`;
  } else {
    li.textContent = text;
  }

  const checkbox = li.querySelector('input');

if (this.selectedValues.has(value)) {
  checkbox.checked = true;
  li.classList.add('bg-[#1A2340]', 'text-white');

  const icon = li.querySelector('.check-icon');
  icon.classList.remove('opacity-0');
}

  li.addEventListener('click', () => {
    if (this.isMultiple) {
      this.toggleOption(index, data, value, text, li);
    } else {
      this.selectOption(index, data, value, text);
    }
  });

  return li;
}

selectOption(index, data, value, text) {
  this.selectedText.textContent = text;
  this.selectedText.classList.remove('text-gray-400');
  this.selectedText.classList.add('text-white');

  // 🔥 mostrar botón clear
  this.clearBtn.classList.remove('hidden');

  this.selectedData$.next(data);
  this.selectedValue$.next(value);

  this.emit('select-change', {
    value,
    data,
    displayText: text
  });

  this.highlightOption(index);
  this.close();
}

  highlightOption(selectedIndex) {
    const items = this.optionsContainer.querySelectorAll('li');

    items.forEach(item => {
      item.classList.remove('bg-[#1A2340]', 'text-white');
    });

    const selected = this.optionsContainer.querySelector(`li[data-index="${selectedIndex}"]`);
    if (selected) {
      selected.classList.add('bg-[#1A2340]', 'text-white');
    }
  }

  /**
   * 🔥 API ORIGINAL (sin cambios)
   */
  onChange(callback) {
    this.selectedValue$.subscribe(callback);
  }

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
    if (!this.isMultiple) {
      const index = this.options.findIndex(opt =>
        this.valueProp ? opt[this.valueProp] === value : opt === value
      );

      if (index !== -1) {
        const data = this.options[index];
        const text = data[this.displayProp];
        this.selectOption(index, data, value, text);
      }
      return;
    }

    // 🔥 MULTI
    if (!Array.isArray(value)) return;

    value.forEach(val => {
      const index = this.options.findIndex(opt =>
        this.valueProp ? opt[this.valueProp] === val : opt === val
      );

      if (index !== -1) {
        const data = this.options[index];
        this.selectedValues.add(val);
        this.selectedItems.set(index, data);
      }
    });

    this.updateMultiUI();
  }

  reset(emitEvent = false) {
    this.selectedText.textContent = this.placeholder;
    this.selectedText.classList.add('text-gray-400');

    this.clearBtn.classList.add('hidden');

    // 🔥 limpiar multi
    this.selectedValues.clear();
    this.selectedItems.clear();

    // limpiar UI
    const items = this.optionsContainer.querySelectorAll('li');
    items.forEach(li => {
      li.classList.remove('bg-[#1A2340]', 'text-white');
      const checkbox = li.querySelector('input');
      const icon = li.querySelector('.check-icon');
      if (icon) icon.classList.add('opacity-0');
      if (checkbox) checkbox.checked = false;
    });

    this.selectedValue$.next(null);
    this.selectedData$.next(null);

    if (emitEvent) {
      this.emit('select-change', {
        value: null,
        data: null,
        displayText: this.placeholder
      });
    }

    this.selectedText.classList.remove('flex', 'gap-1', 'flex-wrap');
  }

  setDisabled(disabled) {
    this.trigger.disabled = disabled;
    this.trigger.classList.toggle('opacity-50', disabled);
  }

updateMultiUI() {
  const values = Array.from(this.selectedValues);
  const data = Array.from(this.selectedItems.values());

  if (values.length === 0) {
    this.reset(true);
    return;
  }

  this.selectedText.innerHTML = ''; // 🔥 limpiar contenido

  data.forEach(item => {
    let text = item[this.displayProp] || '';

    // 🔥 truncar a 15 chars
    if (text.length > 15) {
      text = text.substring(0, 15) + '...';
    }

    // 🔥 crear tag
    const tag = document.createElement('span');
    tag.className = `
      px-2 py-1 text-xs rounded-md 
      bg-blue-500/20 text-blue-400 
      whitespace-nowrap
    `;
    tag.textContent = text;

    this.selectedText.appendChild(tag);
  });

  // 🔥 estilos contenedor
  this.selectedText.classList.remove('text-gray-400');
  this.selectedText.classList.add('flex', 'gap-1', 'flex-wrap');

  this.clearBtn.classList.remove('hidden');

  // 🔥 Reactivo
  this.selectedValue$.next(values);
  this.selectedData$.next(data);

  this.emit('select-change', {
    value: values,
    data,
    displayText: data.map(d => d[this.displayProp]).join(', ')
  });
}
}

customElements.define('select-component', SelectComponent);
