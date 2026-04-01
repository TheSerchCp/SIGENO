/**
 * STORE - Gestor centralizado de estado global con reactividad
 * 
 * Propósito:
 * - Mantener un estado global centralizado para la aplicación
 * - Permitir seleccionar y observar partes específicas del estado
 * - Notificar automáticamente a suscriptores cuando el estado cambia
 * - Proporcionar una forma limpia y reactiva de gestionar el estado
 * 
 * Beneficios:
 * - Centralización: un único punto de verdad para el estado
 * - Selectividad: los componentes solo se suscriben a lo que necesitan
 * - Reactividad: cambios se propagan automáticamente
 * - Escalabilidad: patrón compatible con aplicaciones grandes
 * - Predictibilidad: actualizaciones inmutables del estado
 * 
 * Patrones usados:
 * - Flux/Redux: acciones que modifican estado centralizado
 * - Observer: suscriptores se notifican de cambios
 * - Selector Pattern: permite observar partes del estado
 * - Private Fields: propiedades privadas con # para encapsulación
 * - Immutability: el estado se actualiza con spread operator
 * 
 * Ejemplo de uso:
 * const store = new Store({ counter: 0, user: null });
 * 
 * // Seleccionar y observar parte del estado
 * const counter$ = store.select(state => state.counter);
 * counter$.subscribe(value => console.log('Counter:', value));
 * 
 * // Actualizar estado
 * store.setState({ counter: 1 }); // Notifica suscriptores
 * 
 * // Leer estado actual
 * const currentState = store.getState();
 */

export class Store {
    /**
     * Estado global de la aplicación
     * 
     * Estructura:
     * {
     *   counter: 0,
     *   user: { id: 1, name: 'Juan' },
     *   loading: false,
     *   ...
     * }
     * 
     * Solo puede ser modificado a través de setState()
     * Es privado (#) para evitar mutaciones directas
     * Actualizaciones son inmutables (spread operator)
     * 
     * @private
     * @type {Object}
     */
    #state = {};

    /**
     * Array de funciones suscriptoras
     * 
     * Estructura:
     * [
     *   (newState) => subject1.next(newState.counter),
     *   (newState) => subject2.next(newState.user),
     *   ...
     * ]
     * 
     * Cada suscriptor es una función retornada por select()
     * Se ejecutan cuando setState() notifica cambios
     * Es privado (#) para control interno
     * 
     * @private
     * @type {Array<Function>}
     */
    #subscribers = [];

    /**
     * Constructor - Inicializa el Store con estado inicial
     * 
     * @param {Object} [initialState={}] - Estado inicial de la aplicación
     *                                     Si no se proporciona, comienza vacío
     * 
     * Ejemplos:
     * const store1 = new Store();
     * // Estado: {}
     * 
     * const store2 = new Store({ counter: 0, user: null });
     * // Estado: { counter: 0, user: null }
     * 
     * const store3 = new Store({
     *   counter: 0,
     *   user: { id: 1, name: 'Juan' },
     *   todos: [],
     *   loading: false
     * });
     */
    constructor(initialState = {}) {
        this.#state = initialState;
    }

    /**
     * Selecciona y observa una parte específica del estado
     * 
     * Comportamiento:
     * 1. Crea un ReactivoBehavior con el valor inicial seleccionado
     * 2. Registra una función para actualizar el ReactivoBehavior cuando cambia el estado
     * 3. Retorna el ReactivoBehavior para que se pueda suscribir
     * 
     * @param {Function} selector - Función pura que extrae parte del estado
     *                             Recibe el estado completo y retorna una parte
     * @returns {ReactivoBehavior} Observable reactivo de la parte seleccionada
     *                            Se actualiza automáticamente cuando esa parte cambia
     * 
     * Ejemplos:
     * const store = new Store({ 
     *   counter: 0, 
     *   user: { id: 1, name: 'Juan' },
     *   todos: []
     * });
     * 
     * // Seleccionar propiedad simple
     * const counter$ = store.select(state => state.counter);
     * counter$.subscribe(value => console.log('Counter:', value));
     * 
     * // Seleccionar objeto anidado
     * const user$ = store.select(state => state.user);
     * user$.subscribe(value => console.log('User:', value));
     * 
     * // Seleccionar con transformación
     * const userName$ = store.select(state => state.user?.name);
     * userName$.subscribe(value => console.log('Name:', value));
     * 
     * // Seleccionar con cálculo
     * const isLoggedIn$ = store.select(state => state.user !== null);
     * isLoggedIn$.subscribe(value => console.log('Logged in:', value));
     * 
     * Casos de uso:
     * - Suscribirse a cambios de propiedades específicas
     * - Evitar notificaciones innecesarias por cambios no relevantes
     * - Componentes solo reaccionan a lo que necesitan
     * - Transformaciones del estado antes de consumir
     * 
     * Procesos internos:
     * 1. const subject = new ReactivoBehavior(selector(this.#state))
     *    → Crea ReactivoBehavior con valor inicial seleccionado
     * 
     * 2. this.#subscribers.push((newState) => { ... })
     *    → Registra función que se ejecuta cuando estado cambia
     * 
     * 3. subject.next(selector(newState))
     *    → Actualiza el ReactivoBehavior con nuevo valor seleccionado
     * 
     * 4. return subject
     *    → Retorna el observable para suscribirse
     */
    select(selector) {
        const subject = new ReactivoBehavior(selector(this.#state));
        this.#subscribers.push((newState) => {
            subject.next(selector(newState));
        });
        return subject;
    }

    /**
     * Actualiza el estado de forma inmutable
     * 
     * Comportamiento:
     * 1. Mezcla el estado actual con las actualizaciones
     * 2. Usa spread operator para no mutar directamente
     * 3. Notifica a todos los suscriptores del nuevo estado
     * 
     * @param {Object} updates - Objeto con propiedades a actualizar
     *                          Solo actualiza las propiedades proporcionadas
     *                          Las demás se mantienen igual
     * 
     * Ejemplos:
     * const store = new Store({ 
     *   counter: 0, 
     *   user: { id: 1, name: 'Juan' },
     *   loading: false
     * });
     * 
     * // Actualizar una propiedad
     * store.setState({ counter: 1 });
     * // Nuevo estado: { counter: 1, user: {...}, loading: false }
     * 
     * // Actualizar múltiples propiedades
     * store.setState({ counter: 2, loading: true });
     * // Nuevo estado: { counter: 2, user: {...}, loading: true }
     * 
     * // Reemplazar objeto anidado completo
     * store.setState({ user: { id: 2, name: 'María' } });
     * // Nuevo estado: { counter: 2, user: {...nuevo}, loading: true }
     * 
     * Casos de uso:
     * - Responder a acciones del usuario
     * - Actualizar estado después de llamadas API
     * - Cambiar múltiples propiedades simultáneamente
     * - Mantener estado consistente y predecible
     * 
     * Importante:
     * - El spread operator es shallow (no copia objetos anidados)
     * - Para objetos anidados, pasar el objeto completo actualizado
     * - Evita mutaciones directas para reactividad correcta
     * 
     * Procesos internos:
     * 1. this.#state = { ...this.#state, ...updates }
     *    → Copia estado actual y sobrescribe con actualizaciones
     * 
     * 2. this.#notifySubscribers()
     *    → Avisa a todos los suscriptores del cambio
     */
    setState(updates) {
        this.#state = { ...this.#state, ...updates };
        this.#notifySubscribers();
    }

    /**
     * Obtiene una copia del estado global actual
     * 
     * @returns {Object} Copia superficial del estado global
     *                   Cambios en copia no afectan al estado
     * 
     * Ejemplos:
     * const store = new Store({ counter: 0, user: { id: 1 } });
     * 
     * const state = store.getState();
     * // { counter: 0, user: { id: 1 } }
     * 
     * state.counter = 999; // Cambio en copia
     * const state2 = store.getState();
     * // state2.counter sigue siendo 0 (sin cambios)
     * 
     * Casos de uso:
     * - Leer estado actual sin suscribirse
     * - Tomar decisiones basadas en estado puntual
     * - Debugear: verificar estado global
     * - Obtener todo el estado en un snapshot
     * 
     * Nota sobre spread operator:
     * - Solo copia superficialmente (shallow copy)
     * - Objetos anidados siguen siendo referencias
     * - Para copia profunda: usar JSON.parse(JSON.stringify())
     * 
     * Procesos internos:
     * return { ...this.#state }
     * → Spread operator crea nueva copia del objeto
     */
    getState() {
        return { ...this.#state };
    }

    /**
     * Notifica a todos los suscriptores del cambio de estado
     * 
     * Comportamiento:
     * - Itera sobre cada función suscriptora registrada
     * - Ejecuta cada función pasándole el nuevo estado
     * - Las funciones suscriptoras deciden qué hacer con el cambio
     * 
     * @private
     * 
     * Procesos internos:
     * this.#subscribers.forEach(subscriber => subscriber(this.#state))
     * → Ejecuta cada función suscriptora con estado actual
     * 
     * Detalle de llamantes:
     * - Llamado por setState() después de actualizar estado
     * - Propaga el cambio a través de todas las funciones registradas
     * - Las funciones fueron añadidas por select() internamente
     * 
     * Ejemplo de flujo:
     * 1. store.setState({ counter: 1 })
     * 2. Actualiza this.#state
     * 3. Llama a this.#notifySubscribers()
     * 4. Para cada subscriber en this.#subscribers:
     *    → subscriber(this.#state) ejecuta la función
     *    → Cada función actualiza su ReactivoBehavior
     *    → Todos los observables se notifican
     */
    #notifySubscribers() {
        this.#subscribers.forEach(subscriber => subscriber(this.#state));
    }
}