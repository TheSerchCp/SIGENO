import { BaseComponent } from "../../../src/services/general/BaseComponent";

export class FormComponent extends BaseComponent {
  constructor() {
    super();
    this._initialized = false;
  }

  async connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    await this.loadTemplate(
      '/src/components/form/form.html',
      '#form-template'
    );

    //this.appendChild(template);
    this.cacheDom();
    this.setupEventListeners();
  }

  cacheDom() {
    this.form = this.querySelector('form');
    this.errorDiv = this.querySelector('#form-error');
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.form.addEventListener('reset', () => {
      this.clearErrors();
    });
  }

  async handleSubmit() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // Validar
    if (!this.validate()) {
      return;
    }

    // Emitir evento con datos
    this.dispatchEvent(new CustomEvent('submit', {
      detail: data,
      bubbles: true
    }));

    this.clearErrors();
  }

  validate() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (input.hasAttribute('required') && !input.value) {
        isValid = false;
        this.showError(`${input.name} es requerido`);
      }
    });

    return isValid;
  }

  showError(msg) {
    this.errorDiv.textContent = msg;
    this.errorDiv.classList.remove('hidden');
  }

  clearErrors() {
    this.errorDiv.classList.add('hidden');
    this.errorDiv.textContent = '';
  }
}

customElements.define('app-form', FormComponent);