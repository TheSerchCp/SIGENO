/**
 * THEME SERVICE - Manejo global de tema (light / dark)
 * 
 * - Usa clase `dark` en <html>
 * - Persiste en localStorage
 * - Expone estado reactivo
 */

import { ReactivoBehavior } from './ReactiveBehavior.js';

class ThemeService {
  constructor() {
    if (typeof document === 'undefined') {
      this.currentTheme = new ReactivoBehavior('light');
      return;
    }
    console.log('Inicializando ThemeService...');

    const initialTheme = this.getInitialTheme();
    this.currentTheme = new ReactivoBehavior(initialTheme);

    // Si no hay tema guardado en localStorage, guardarlo ahora
    if (typeof localStorage !== 'undefined' && !localStorage.theme) {
      localStorage.theme = initialTheme;
    }

    // Aplicar inmediatamente
    this.applyTheme(initialTheme);
  }

  /**
   * Obtiene el tema inicial:
   * 1. localStorage
   * 2. preferencia del sistema
   */
  getInitialTheme() {
    if (typeof localStorage === 'undefined') {
      return 'light';
    }

    if (localStorage.theme === 'dark') return 'dark';
    if (localStorage.theme === 'light') return 'light';

    // Si no hay preferencia guardada, detectar del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  /**
   * Aplica el tema al <html>
   */
  applyTheme(theme) {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;

    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  /**
   * Establece un tema explícito
   */
  setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') {
      console.error('Tema inválido. Usa "dark" o "light"');
      return;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.theme = theme;
    }

    this.applyTheme(theme);
    this.currentTheme.next(theme);
  }

  /**
   * Alterna entre light/dark
   */
  toggleTheme() {
    const newTheme = this.isDarkMode() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Usa preferencia del sistema
   */
  useSystemPreference() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('theme');
    }

    const systemTheme = this.getInitialTheme();
    this.applyTheme(systemTheme);
    this.currentTheme.next(systemTheme);
  }

  /**
   * Helpers
   */
  isDarkMode() {
    return this.currentTheme.getValue() === 'dark';
  }

  getCurrentTheme() {
    return this.currentTheme.getValue();
  }

  reset() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('theme');
    }

    const initialTheme = this.getInitialTheme();
    this.applyTheme(initialTheme);
    this.currentTheme.next(initialTheme);
  }
}

export const themeService = new ThemeService();