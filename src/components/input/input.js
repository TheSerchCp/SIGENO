import { BaseComponent } from "../../services/general/BaseComponent.js";
import { ReactivoBehavior } from "../../services/general/ReactiveBehavior.js";

export class InputComponent extends BaseComponent {
  static get observedAttributes() {
    return ['type', 'placeholder', 'value', 'disabled', 'required', 'class', 'label','icon', 'label-position', 'bg-color', 'padding'];
  }

  constructor() {
    super();
    this._initialized = false;
    this._validators = [];
    this._touched = false;
    
    // ReactivoBehaviors para estado reactivo
    this.value$ = new ReactivoBehavior('');
    this.disabled$ = new ReactivoBehavior(false);
    this.type$ = new ReactivoBehavior('text');
    this.customClasses$ = new ReactivoBehavior('');
    this.label$ = new ReactivoBehavior('');
    this.icon$ = new ReactivoBehavior('');
    this.labelPosition$ = new ReactivoBehavior('right');
    this.bgColor$ = new ReactivoBehavior('#2852EF');
    this.padding$ = new ReactivoBehavior('2');
  }

  async connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const type = this.getAttribute('type') || 'text';
    
    // Cargar template según el tipo
    if (type === 'checkbox' || type === 'checkbox-group') {
      await this.loadTemplate('/src/components/input/input.html', '#checkbox-template');
    } else if (type === 'radio-button' || type === 'radio-group') {
      await this.loadTemplate('/src/components/input/input.html', '#radio-template');
    } else {
      await this.loadTemplate('/src/components/input/input.html', '#input-template');
    }
    
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
    const iconClass = this.getAttribute('icon');
    const labelPosition = this.getAttribute('label-position') || 'right';
    const bgColor = this.getAttribute('bg-color') || '#2852EF';
    const padding = this.getAttribute('padding') || '2';

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
    if (label) {
      this.label$.next(label);
      // Para checkbox y radio, asignar el label directamente
      if ((type === 'checkbox' || type === 'radio-button') && this.elements?.label) {
        this.elements.label.textContent = label;
      }
    }
    if(iconClass) this.icon$.next(iconClass);
    
    this.labelPosition$.next(labelPosition);
    this.bgColor$.next(bgColor);
    this.padding$.next(padding);
    
    // Aplicar estilos si es checkbox o radio - usar type directo, no type$.getValue()
    if (type === 'checkbox' || type === 'radio-button') {
      // Esperar un tick para que los estilos se apliquen después de que el DOM esté completo
      setTimeout(() => this.applyCheckboxRadioStyles(), 0);
    }
  }


  cacheDom() {
    const type = this.type$.getValue() || this.getAttribute('type') || 'text';
    
    if (type === 'checkbox') {
      this.elements = {
        input: this.querySelector('#checkbox-field'),
        wrapper: this.querySelector('.checkbox-wrapper'),
        label: this.querySelector('#checkbox-text'),
        labelWrapper: this.querySelector('#checkbox-label'),
        error: this.querySelector('slot[name="error"]')
      };
    } else if (type === 'radio-button') {
      this.elements = {
        input: this.querySelector('#radio-field'),
        wrapper: this.querySelector('.radio-wrapper'),
        label: this.querySelector('#radio-text'),
        labelWrapper: this.querySelector('#radio-label'),
        error: this.querySelector('slot[name="error"]')
      };
    } else {
      this.elements = {
        input: this.querySelector('#input-field'),
        wrapper: this.querySelector('.input-wrapper'),
        label: this.querySelector('#label'),
        error: this.querySelector('slot[name="error"]'),
        passwordToggle: this.querySelector('#password-toggle'),
        iconField: this.querySelector('#icon-field')
      };
    }
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

    this.icon$.subscribe(iconClass => {
      console.log("Clase icono: ", iconClass)
      this.applyIcon(iconClass);
    });

    this.labelPosition$.subscribe(() => {
      this.applyCheckboxRadioStyles();
    });

    this.bgColor$.subscribe(() => {
      this.applyCheckboxRadioStyles();
    });

    this.padding$.subscribe(() => {
      this.applyCheckboxRadioStyles();
    });
  }

  applyIcon(iconClass){
    const type = this.type$.getValue();
    let iconLi = this.querySelector('#icon-field');
    // No mostrar iconos en radio-button y checkbox
    if (type === 'radio-button' || type === 'checkbox') {
      if(iconLi) iconLi.remove();
      return;
    }
    
    const baseClass = "text-[#303556] text-lg font-regular absolute ml-2 mr-6";
    console.log("Hay clase icono: ", iconClass.length > 0)
    if(iconClass && iconLi){
      iconLi.classList.add(...baseClass.split(' '), ...iconClass.split(' '));
    }else if(iconLi){
      iconLi.remove();
    }
  }

  applyCheckboxRadioStyles() {
    const type = this.type$.getValue();
    if (type !== 'checkbox' && type !== 'radio-button') return;

    const labelPosition = this.labelPosition$.getValue();
    const bgColor = this.bgColor$.getValue();
    const padding = this.padding$.getValue();

    // Re-cachear los elementos para asegurar que existan
    this.cacheDom();

    if (!this.elements?.input || !this.elements?.labelWrapper) return;

    // Aplicar estilos al checkbox/radio
    this.elements.input.className = 'checkbox-input cursor-pointer rounded';
    
    // Para valores dinámicos, usamos inline styles con CSS variables como Tailwind
    this.elements.input.style.backgroundColor = bgColor;
    this.elements.input.style.accentColor = bgColor;
    this.elements.input.style.setProperty('--spacing', '0.25rem');
    this.elements.input.style.paddingBlock = `calc(var(--spacing) * ${padding})`;
    this.elements.input.style.paddingInline = `calc(var(--spacing) * ${padding})`;

    // Aplicar flexbox según label-position usando clases de Tailwind
    const wrapper = this.elements.labelWrapper;
    
    if (labelPosition === 'right') {
      wrapper.className = 'flex items-center gap-2 cursor-pointer';
    } else if (labelPosition === 'left') {
      wrapper.className = 'flex items-center gap-2 cursor-pointer flex-row-reverse';
    } else if (labelPosition === 'top') {
      wrapper.className = 'flex flex-col items-start gap-2 cursor-pointer';
    }

    // Asegurar que el label tenga el texto
    if (this.elements?.label && this.label$.getValue()) {
      this.elements.label.textContent = this.label$.getValue();
    }
  }

  setupEventListeners() {
    this.listen(this.elements.input, 'input', (e) => {
      // Marcar como touched cuando comienza a escribir
      this._touched = true;
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

    // Setup password toggle si es necesario
    this.setupPasswordToggle();
  }

  setupPasswordToggle() {
    if (!this.elements?.passwordToggle) return;
    
    const type = this.type$.getValue();
    if (type === 'password') {
      this.elements.passwordToggle.style.display = 'block';
      this.listen(this.elements.passwordToggle, 'click', (e) => {
        e.preventDefault();
        const isPassword = this.elements.input.type === 'password';
        this.elements.input.type = isPassword ? 'text' : 'password';
        const icon = this.elements.passwordToggle.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      });
    } else {
      this.elements.passwordToggle.style.display = 'none';
    }
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

    // Actualizar toggle de password
    this.setupPasswordToggle();
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
    const inputF = this.querySelector('#input-field');
    const baseClasses = 'w-full py-3 border border-[#303556] rounded-md focus:outline-hidden focus:border-2 focus:border-blue-500 placeholder:text-[#303556] text-gray-500 dark:text-white bg-white dark:bg-[#101532]';
    inputF.classList.add(...baseClasses.split(' '),...customClasses.split(' '))
    console.log("Clase icono: ",this.icon$.getValue())
    if(this.icon$.getValue()){
      inputF.classList.add('pr-3','pl-8')
    }else{
      inputF.classList.add('px-3');
    }
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
      case 'label-position':
        this.labelPosition$.next(newValue || 'right');
        break;
      case 'bg-color':
        this.bgColor$.next(newValue || '#2852EF');
        break;
      case 'padding':
        this.padding$.next(newValue || '2');
        break;
    }
  }

  validate() {
    // Solo validar si el campo ha sido tocado (ha comenzado a escribir)
    if (!this._touched) {
      return true;
    }
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
      isValid: this.validate(),
      touched: this._touched
    };
  }

  resetTouched() {
    this._touched = false;
  }

  setTouched(touched = true) {
    this._touched = touched;
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
      'checkbox': { inputType: 'checkbox', pattern: null },
      'radio-button': { inputType: 'radio', pattern: null },
    };
    return configs[type] || configs['text'];
  }
}

customElements.define('input-component', InputComponent);