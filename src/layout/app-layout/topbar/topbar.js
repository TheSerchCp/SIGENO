/**
 * AppTopbar - Web Component para la barra superior de la aplicación
 */
import { BaseComponent } from '/src/services/general/BaseComponent.js';
import { themeService } from '/src/services/general/theme.service.js';
import { toastService } from '../../../services/general/toast.service.js';


class AppTopbar extends BaseComponent {
  static get observedAttributes() {
    return ['text'];
  }

  async connectedCallback() {
    await this.loadTemplate('/src/layout/app-layout/topbar/topbar.html', '#topbar-template');
    this.cacheDom();
    this.update();
    this.setupThemeToggle();
    this.subscribeToThemeChanges();
    this.setupEventListeners();
  }

  attributeChangedCallback(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.update();
    }
  }

  cacheDom() {
    this.$topbar = this.querySelector('[data-topbar]');
    this.$themeToggle = this.querySelector('#theme-toggle');
    this.$themeIcon = this.querySelector('#theme-icon');
    this.$themeText = this.querySelector('#theme-text');
    this.$testToast = this.querySelector('#test-toast');
  }

  update() {
    if(this.$topbar) {
      console.log("Local user", localStorage.getItem('currentUser'))
      const userObject = JSON.parse(localStorage.getItem('currentUser'));
      console.log("Nombre usuario: ", userObject.name)
      let textWelcomeUser = 'Hola, ' + (userObject.name);
      console.log("Welcome user: ", textWelcomeUser)
      this.$topbar.textContent = textWelcomeUser ?? '';
    }
  }

  setupThemeToggle() {
    if (!this.$themeToggle) return;

    // Mostrar estado inicial del tema
    const isDark = themeService.isDarkMode();
    this.updateThemeUI(isDark);

    // Alternador de tema
    this.$themeToggle.addEventListener('click', () => {
      themeService.toggleTheme();
    });
  }

  /**
   * Se suscribe a cambios del servicio de tema
   * Se ejecuta cuando el tema cambia mediante toggleTheme() o setTheme()
   */
  subscribeToThemeChanges() {
    themeService.currentTheme.subscribe(theme => {
      const isDark = theme === 'dark';
      this.updateThemeUI(isDark);
    });
  }

  updateThemeUI(isDark) {
    if (!this.$themeIcon || !this.$themeText) return;
    
    if (isDark) {
      this.$themeIcon.textContent = '☀️';
      this.$themeText.textContent = 'Light';
    } else {
      this.$themeIcon.textContent = '🌙';
      this.$themeText.textContent = 'Dark';
    }
  }

  setupEventListeners(){
      this.$testToast.addEventListener('click', () => {
             toastService.success(
                    'Bienvenido',
                    `Sesión iniciada como test`,
                    3000
                );
    });
  }
}

customElements.define('app-topbar', AppTopbar);
