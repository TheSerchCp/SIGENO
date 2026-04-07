import { BaseComponent } from "../../services/general/BaseComponent.js";
import { ReactivoBehavior } from "../../services/general/ReactiveBehavior.js";

export class InputComponent extends BaseComponent {
  static get observedAttributes() {
    return ['type', 'placeholder', 'value', 'disabled', 'required', 'class', 'label'];
  }

  constructor() {
    super();
    this._initialized = false;
    this._validators = [];
    
    // ReactivoBehaviors para estado reactivo
    this.value$ = new ReactivoBehavior('');
    this.disabled$ = new ReactivoBehavior(false);
    this.type$ = new ReactivoBehavior('text');
    this.customClasses$ = new ReactivoBehavior('');
    this.label$ = new ReactivoBehavior('');
  }

  async connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    await this.loadTemplate('/src/components/input/input.html', '#input-template');
    
    this.cacheDom();
    
    // Leer atributos iniciales
    this.initializeAttributes();
    
    this.subscribeToChanges();
    this.setupEventListeners();
    this.applyConfig();
  }

  initializeAttributes() {
    // Leer atributos presentes en la inicialización
    const type = this.getAttribute('type');
    const placeholder = this.getAttribute('placeholder');
    const value = this.getAttribute('value');
    const disabled = this.hasAttribute('disabled');
    const required = this.hasAttribute('required');
    const customClasses = this.getAttribute('class');
    const label = this.getAttribute('label');

    if (type) this.type$.next(type);
    if (placeholder && this.elements?.input) {
      this.elements.input.placeholder = placeholder;
    }
    if (value) this.value$.next(value);
    if (disabled) this.disabled$.next(true);
    if (required && this.elements?.input) {
      this.elements.input.setAttribute('required', '');
    }
    if (customClasses) this.customClasses$.next(customClasses);
    if (label) this.label$.next(label);
  }


  cacheDom() {
    this.elements = {
      input: this.querySelector('#input-field'),
      wrapper: this.querySelector('.input-wrapper'),
      label: this.querySelector('#label'),
      error: this.querySelector('slot[name="error"]')
    };
  }

  subscribeToChanges() {
    this.value$.subscribe(val => {
      if (this.elements?.input) {
        this.elements.input.value = val;
      }
    });

    this.disabled$.subscribe(disabled => {
      if (this.elements?.input) {
        this.elements.input.disabled = disabled;
      }
    });

    this.type$.subscribe(() => {
      this.applyConfig();
    });

    this.customClasses$.subscribe(() => {
      this.applyCustomClasses();
    });

    this.label$.subscribe(labelText => {
      if (this.elements?.label) {
        this.elements.label.textContent = labelText;
      }
    });
  }

  setupEventListeners() {
    this.listen(this.elements.input, 'input', (e) => {
      this.value$.next(e.target.value);
      this.emit('input-change', { value: e.target.value });
    });

    this.listen(this.elements.input, 'change', (e) => {
      this.emit('input-changed', { value: e.target.value });
    });

    this.listen(this.elements.input, 'blur', (e) => {
      const isValid = this.validate();
      this.emit('input-blur', { value: e.target.value, isValid });
    });

    this.listen(this.elements.input, 'focus', (e) => {
      this.emit('input-focus', { value: e.target.value });
    });
  }

  applyConfig() {
    const type = this.type$.getValue();
    const config = this.getTypeConfig(type);
    
    if (this.elements?.input) {
      this.elements.input.type = config.inputType;
      
      // Limpiar validadores previos
      this._validators = [];
      if (config.pattern) {
        this._validators.push(value => new RegExp(config.pattern).test(value));
      }

      if (type === 'currency') {
        this.setupCurrencyMask();
      }
    }
  }

  setupCurrencyMask() {
    if (!this.elements?.input) return;

    const handleCurrencyInput = (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = new Intl.NumberFormat('es-MX').format(value);
      this.value$.next(value);
    };

    this.listen(this.elements.input, 'input', handleCurrencyInput);
  }

  applyCustomClasses() {
    if (!this.elements?.input) return;

    const customClasses = this.customClasses$.getValue();
    const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-hidden focus:border-2 focus:border-blue-500 placeholder:text-gray-300 text-gray-500';
    this.elements.input.className = `${baseClasses} ${customClasses}`.trim();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._initialized) return;

    switch(name) {
      case 'type':
        this.type$.next(newValue || 'text');
        break;
      case 'placeholder':
        if (this.elements?.input) {
          this.elements.input.placeholder = newValue || '';
        }
        break;
      case 'value':
        this.value$.next(newValue || '');
        break;
      case 'disabled':
        this.disabled$.next(newValue !== null);
        break;
      case 'required':
        if (this.elements?.input) {
          newValue !== null 
            ? this.elements.input.setAttribute('required', '')
            : this.elements.input.removeAttribute('required');
        }
        break;
      case 'class':
        this.customClasses$.next(newValue || '');
        break;
      case 'label':
        this.label$.next(newValue || '');
        break;
    }
  }

  validate() {
    const value = this.value$.getValue();
    const isValid = this._validators.every(validator => validator(value));
    return isValid;
  }

  // Métodos públicos para control programático
  setValue(value) {
    this.value$.next(value);
  }

  getValue() {
    return this.value$.getValue();
  }

  setDisabled(disabled) {
    this.disabled$.next(disabled);
  }

  setType(type) {
    this.type$.next(type);
  }

  setLabel(label) {
    this.label$.next(label);
  }

  addClasses(classes) {
    const current = this.customClasses$.getValue();
    const newClasses = current ? `${current} ${classes}` : classes;
    this.customClasses$.next(newClasses);
  }

  removeClasses(classes) {
    const current = this.customClasses$.getValue();
    const classArray = current.split(' ').filter(c => !classes.split(' ').includes(c));
    this.customClasses$.next(classArray.join(' '));
  }

  addValidator(validatorFn) {
    this._validators.push(validatorFn);
  }

  clearValidators() {
    this._validators = [];
  }

  getState() {
    return {
      value: this.value$.getValue(),
      disabled: this.disabled$.getValue(),
      type: this.type$.getValue(),
      label: this.label$.getValue(),
      customClasses: this.customClasses$.getValue(),
      isValid: this.validate()
    };
  }

  getTypeConfig(type) {
    const configs = {
      'text': { inputType: 'text', pattern: null },
      'email': { inputType: 'email', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
      'password': { inputType: 'password', pattern: null },
      'number': { inputType: 'number', pattern: null },
      'tel': { inputType: 'tel', pattern: '^[0-9\\-\\+\\s\\(\\)]*$' },
      'url': { inputType: 'url', pattern: null },
      'date': { inputType: 'date', pattern: null },
      'currency': { inputType: 'text', pattern: null },
    };
    return configs[type] || configs['text'];
  }
}

customElements.define('input-component', InputComponent);