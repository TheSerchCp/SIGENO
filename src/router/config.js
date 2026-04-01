 /**
     * Tabla de rutas de la aplicación
     * Define qué layout y componente se cargan para cada URL
     * 
     * Estructura de cada ruta:
     * {
     *   layout: "nombre-web-component" | null,  // null = sin layout
     *   component: () => Promise<string>         // Función que retorna HTML del componente
     * }
     * 
     * Ejemplos:
     * - /login: sin layout, solo renderiza <login-component>
     * - /home: con layout app-layout, renderiza componente dentro del outlet
     * 
     * El componente es una función que retorna una Promise
     * para soportar carga dinámica con import()
     */
export const routesConfig =  {
      "/":{
        layout: null,
        component: () => import('/src/views/public/login/login.js')
          .then(() => '<login-component></login-component>'),
      },
      
      "/login": {
        layout: null,
        component: () => import('/src/views/public/login/login.js')
          .then(() => '<login-component></login-component>'),
      },
      
      "/home": {
        layout: 'app-layout',
        component: () => import('/src/views/private/home/home.js')
          .then(() => '<home-component></home-component>'),
      }
    };