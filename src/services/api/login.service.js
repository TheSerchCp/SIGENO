/**
 * LOGIN SERVICE - Servicio de autenticación
 * 
 * Propósito:
 * - Gestionar usuarios y roles (admin, jugador, soporte)
 * - Simular login/logout
 * - Validar credenciales
 * - Almacenar token y datos del usuario
 * - Proporcionar información del usuario autenticado
 * 
 * Uso:
 * import { loginService } from './login.service.js';
 * 
 * const result = await loginService.login(email, password);
 * if (result.success) {
 *   console.log('Usuario:', result.user);
 * }
 */

import { ReactivoBehavior } from '../general/ReactiveBehavior.js';

// Usuarios predefinidos
const USERS = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
    avatar: '👨‍💼'
  },
  {
    id: 2,
    email: 'jugador@example.com',
    password: 'jugador123',
    name: 'Jugador',
    role: 'jugador',
    avatar: '🎮'
  },
  {
    id: 3,
    email: 'soporte@example.com',
    password: 'soporte123',
    name: 'Soporte',
    role: 'soporte',
    avatar: '🎧'
  }
];

class LoginService {
  constructor() {
    // Usuario autenticado actual
    this.currentUser = new ReactivoBehavior(null);
    
    // Token de autenticación
    this.authToken = new ReactivoBehavior(null);
    
    // Estado de autenticación
    this.isAuthenticated = new ReactivoBehavior(false);
    
    // Restaurar usuario si existe en localStorage
    this.restoreSession();
  }

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} - Resultado del login
   */
  async login(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validar que email y contraseña no estén vacíos
        if (!email || !password) {
          resolve({
            success: false,
            message: 'Email y contraseña son requeridos'
          });
          return;
        }

        // Buscar usuario
        const user = USERS.find(u => u.email === email && u.password === password);

        if (user) {
          // Generar token simulado
          const token = this.generateToken();
          
          // Guardar usuario y token
          const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar
          };

          this.currentUser.next(userData);
          this.authToken.next(token);
          this.isAuthenticated.next(true);

          // Guardar en localStorage
          localStorage.setItem('currentUser', JSON.stringify(userData));
          localStorage.setItem('authToken', token);
          localStorage.setItem('userEmail', userData.email);

          console.log('✓ Login exitoso:', userData.email);

          resolve({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: userData,
            token: token
          });
        } else {
          resolve({
            success: false,
            message: 'Credenciales inválidas. Intenta con: admin@example.com / admin123'
          });
        }
      }, 1500); // Simular delay de red
    });
  }

  /**
   * Cierra la sesión actual
   */
  logout() {
    this.currentUser.next(null);
    this.authToken.next(null);
    this.isAuthenticated.next(false);
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    
    console.log('✓ Logout exitoso');
  }

  /**
   * Restaura la sesión desde localStorage
   */
  restoreSession() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUser.next(user);
        this.authToken.next(token);
        this.isAuthenticated.next(true);
        console.log('✓ Sesión restaurada:', user.email);
      } catch (error) {
        console.error('Error restaurando sesión:', error);
        this.logout();
      }
    }
  }

  /**
   * Genera un token simulado
   * @returns {string}
   */
  generateToken() {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene el usuario actual
   * @returns {Object|null}
   */
  getCurrentUser() {
    return this.currentUser.getValue();
  }

  /**
   * Obtiene el token actual
   * @returns {string|null}
   */
  getToken() {
    return this.authToken.getValue();
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.isAuthenticated.getValue();
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar (admin, jugador, soporte)
   * @returns {boolean}
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {Array<string>} roles - Array de roles
   * @returns {boolean}
   */
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  }

  /**
   * Obtiene los usuarios disponibles (para desarrollo/demo)
   * @returns {Array}
   */
  getAvailableUsers() {
    return USERS.map(({ password, ...user }) => user); // Sin contraseña
  }

  /**
   * Obtiene información sobre los usuarios de prueba
   * @returns {string}
   */
  getTestCredentials() {
    return `
      USUARIOS DE PRUEBA:
      
      Admin:
      Email: admin@example.com
      Password: admin123
      Role: admin
      
      Jugador:
      Email: jugador@example.com
      Password: jugador123
      Role: jugador
      
      Soporte:
      Email: soporte@example.com
      Password: soporte123
      Role: soporte
    `;
  }
}

// Exportar instancia única (singleton)
export const loginService = new LoginService();
