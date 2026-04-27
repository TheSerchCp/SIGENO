 import { BaseComponent } from "../../../src/services/general/BaseComponent";

export class TextComponent extends BaseComponent {
    constructor(){
        super();
        this._initialized = false;
    }


    async connectedCallback(){
        if(this._initialized) return;
        this._initialized = true;
        await this.loadTemplate(
            '/src/components/text/text.html',
            '#text-template'
        );

        this.cacheDom();
        this.update();
    }

    cacheDom() {
        this.wrapper = this.querySelector('#text-wrapper');
    }

      update() {
    const variant = this.getAttribute('variant') || 'body';
    const size = this.getAttribute('size') || 'base';
    const weight = this.getAttribute('weight') || 'normal';
    const color = this.getAttribute('color') || 'text-gray-300';

    const variants = {
      'h1': 'text-4xl font-bold',
      'h2': 'text-3xl font-bold',
      'h3': 'text-2xl font-bold',
      'h4': 'text-xl font-bold',
      'h5': 'text-lg font-bold',
      'h6': 'text-base font-bold',
      'body': 'text-base',
      'label': 'text-sm font-semibold',
      'small': 'text-xs',
      'caption': 'text-xs text-gray-500'
    };

    const sizes = {
      'xs': 'text-xs',
      'sm': 'text-sm',
      'base': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl'
    };

    const weights = {
      'light': 'font-light',
      'normal': 'font-normal',
      'semibold': 'font-semibold',
      'bold': 'font-bold'
    };

    const variantClass = variants[variant] || variants['body'];
    const sizeClass = sizes[size];
    const weightClass = weights[weight];

    this.wrapper.className = `${variantClass} ${sizeClass || ''} ${weightClass || ''} ${color}`;
  }

    attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this._initialized) {
      this.update();
    }
  }
}

customElements.define('app-text', TextComponent);