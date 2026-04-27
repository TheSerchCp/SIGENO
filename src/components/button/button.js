import { BaseComponent } from '../../services/general/BaseComponent.js';
import { ReactivoBehavior } from '../../services/general/ReactiveBehavior.js';

export class ButtonComponent extends BaseComponent {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'class', 'text'];
  }

  constructor() {
    super();
    this._initialized = false;
    
    // ReactivoBehaviors para estado reactivo
    this.variant$ = new ReactivoBehavior('primary');
    this.size$ = new ReactivoBehavior('md');
    this.disabled$ = new ReactivoBehavior(false);
    this.loading$ = new ReactivoBehavior(false);
    this.customClasses$ = new ReactivoBehavior('');
    this.text$ = new ReactivoBehavior('');
  }

  async connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    await this.loadTemplate('/src/components/button/button.html', '#button-template');
    this.cacheDom();
    
    // Leer atributos iniciales
    this.initializeAttributes();
    
    this.subscribeToChanges();
    this.setupEventListeners();
    this.update();
  }

  initializeAttributes() {
    // Leer atributos presentes en la inicialización
    const variant = this.getAttribute('variant');
    const size = this.getAttribute('size');
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');
    const customClasses = this.getAttribute('class');
    const text = this.getAttribute('text');

    if (variant) this.variant$.next(variant);
    if (size) this.size$.next(size);
    if (disabled) this.disabled$.next(true);
    if (loading) this.loading$.next(true);
    if (customClasses) this.customClasses$.next(customClasses);
    if (text) this.text$.next(text);
  }


  cacheDom() {
    this.btn = this.querySelector('#btn');
    this.content = this.querySelector('#content');
  }

  subscribeToChanges() {
    // Suscribirse a cambios reactivos
    this.variant$.subscribe(() => this.update());
    this.size$.subscribe(() => this.update());
    this.disabled$.subscribe(disabled => {
      this.btn.disabled = disabled || this.loading$.getValue();
    });
    this.loading$.subscribe(loading => {
      this.btn.disabled = loading || this.disabled$.getValue();
      this.updateButtonContent();
    });
    this.customClasses$.subscribe(() => this.update());
    this.text$.subscribe(() => this.updateButtonContent());
  }

  setupEventListeners() {
    this.listen(this.btn, 'click', (e) => {
      if (this.loading$.getValue()) {
        e.preventDefault();
      }
      this.emit('button-click', { loading: this.loading$.getValue() });
    });
  }

  update() {
    const variant = this.variant$.getValue();
    const size = this.size$.getValue();
    const customClasses = this.customClasses$.getValue();

    const variantClasses = this.getVariantClasses(variant);
    const sizeClasses = this.getSizeClasses(size);

    // Combinar clases base, variantes, tamaños y clases personalizadas
    const baseClasses = 'px-4 py-2 rounded-md font-semibold transition disabled:opacity-50';
    this.btn.className = `${baseClasses} ${variantClasses} ${sizeClasses} ${customClasses}`.trim();
    
    this.updateButtonContent();
  }

  updateButtonContent() {
    const loading = this.loading$.getValue();
    const text = this.text$.getValue();
    
    if (loading) {
      this.content.textContent = '⏳ Cargando...';
    } else {
      // Usar atributo text si existe, sino usar textContent del elemento
      this.content.textContent = text || this.textContent?.trim() || 'Click';
    }
  }

  getVariantClasses(variant) {
    const variants = {
      'primary': 'bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white dark:bg-blue-700 dark:hover:bg-blue-600',
      'secondary': 'bg-gray-600 hover:bg-gray-700 text-white hover:cursor-pointer dark:bg-gray-700 dark:hover:bg-gray-600',
      'danger': 'bg-red-600 hover:bg-red-700 text-white hover:cursor-pointer dark:bg-red-700 dark:hover:bg-red-600',
      'success': 'bg-green-600 hover:bg-green-700 text-white hover:cursor-pointer dark:bg-green-700 dark:hover:bg-green-600',
      'outline': 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:cursor-pointer dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20',
      'ghost': 'text-gray-600 hover:bg-gray-100 hover:cursor-pointer dark:text-gray-400 dark:hover:bg-gray-800',
      'whiter': 'bg-[#FBFAFC] text-[#000111] hover:bg-gray-100 hover:cursor-pointer dark:text-gray-400 dark:hover:bg-gray-800',

    };
    return variants[variant] || variants['primary'];
  }

  getSizeClasses(size) {
    const sizes = {
      'sm': 'px-2 py-1 text-sm',
      'md': 'px-4 py-2 text-base',
      'lg': 'px-6 py-3 text-lg',
      'xl': 'px-8 py-4 text-xl'
    };
    return sizes[size] || sizes['md'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._initialized) return;

    switch(name) {
      case 'variant':
        this.variant$.next(newValue || 'primary');
        break;
      case 'size':
        this.size$.next(newValue || 'md');
        break;
      case 'disabled':
        this.disabled$.next(newValue !== null);
        break;
      case 'loading':
        this.loading$.next(newValue !== null);
        break;
      case 'class':
        this.customClasses$.next(newValue || '');
        break;
      case 'text':
        this.text$.next(newValue || '');
        break;
    }
  }

  // Métodos públicos para control programático
  setVariant(variant) {
    this.variant$.next(variant);
  }

  setSize(size) {
    this.size$.next(size);
  }

  setLoading(loading) {
    this.loading$.next(loading);
  }

  setDisabled(disabled) {
    this.disabled$.next(disabled);
  }

  setText(text) {
    this.text$.next(text);
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

  getState() {
    return {
      variant: this.variant$.getValue(),
      size: this.size$.getValue(),
      disabled: this.disabled$.getValue(),
      loading: this.loading$.getValue(),
      customClasses: this.customClasses$.getValue(),
      text: this.text$.getValue()
    };
  }
}

customElements.define('app-button', ButtonComponent);
