/**
 * REACTIVE BEHAVIOR - Servicio reactivo para gestionar estado y suscripciones
 * 
 * Propósito:
 * - Mantener un valor de estado interno
 * - Notificar automáticamente a suscriptores cuando el valor cambia
 * - Proporcionar una forma limpia de desuscribirse
 * - Implementar patrón Observer/Pub-Sub
 * 
 * Beneficios:
 * - Reactividad: cambios en el estado se propagan automáticamente
 * - Desacoplamiento: los suscriptores no necesitan conocerse
 * - Control de memoria: permite desuscribirse para evitar memory leaks
 * - Simplicidad: interfaz clara y fácil de usar
 * 
 * Patrones usados:
 * - Observer: suscriptores se registran y reciben notificaciones
 * - Pub-Sub: publicador (ReactiveBehavior) notifica a varios suscriptores
 * - Private Fields: propiedades privadas con # para encapsulación
 * - Closure: la función de desuscripción captura la referencia del callback
 * 
 * Ejemplo de uso:
 * const counter = new ReactivoBehavior(0);
 * const unsubscribe = counter.subscribe(value => console.log(value));
 * counter.next(1); // notifica al suscriptor
 * unsubscribe(); // deja de recibir notificaciones
 */

export class ReactivoBehavior {
    /**
     * Valor interno del estado
     * 
     * Almacena el estado actual de la instancia
     * Solo puede ser modificado a través del método next()
     * Es privado (#) para evitar accesos directos
     * 
     * @private
     * @type {*}
     */
    #value;

    /**
     * Array de funciones suscriptoras
     * 
     * Estructura:
     * [
     *   (value) => console.log(value),
     *   (value) => updateDOM(value),
     *   ...
     * ]
     * 
     * Se inicializa vacío y crece con cada suscripción
     * Se reduce cuando se llama a la función de desuscripción
     * 
     * @private
     * @type {Array<Function>}
     */
    #subscribers = [];

    /**
     * Constructor - Inicializa el ReactiveBehavior con valor inicial
     * 
     * @param {*} initialValue - Valor inicial del estado
     *                          Ejemplo: 0, '', null, {}, []
     * 
     * Ejemplo:
     * const name = new ReactivoBehavior('Juan');
     * const count = new ReactivoBehavior(0);
     * const user = new ReactivoBehavior({ id: 1, name: 'Juan' });
     */
    constructor(initialValue) {
        this.#value = initialValue;
    }

    /**
     * Se suscribe a cambios del estado
     * 
     * Comportamiento:
     * 1. Ejecuta el callback inmediatamente con el valor actual
     * 2. Registra el callback para futuras notificaciones
     * 3. Retorna función para desuscribirse
     * 
     * @param {Function} callback - Función que se ejecuta cuando cambia el valor
     *                             Recibe el nuevo valor como parámetro
     * @returns {Function} Función de desuscripción (unsubscribe)
     *                    Llamarla previene futuras notificaciones
     * 
     * Ejemplo:
     * const reactiveState = new ReactivoBehavior('hola');
     * 
     * const unsubscribe = reactiveState.subscribe(value => {
     *   console.log('Nuevo valor:', value);
     * });
     * // Salida inmediata: "Nuevo valor: hola"
     * 
     * reactiveState.next('adiós');
     * // Salida: "Nuevo valor: adiós"
     * 
     * unsubscribe();
     * 
     * reactiveState.next('no se ve');
     * // Sin salida (se desuscribió)
     * 
     * Casos de uso:
     * - Actualizar componentes cuando el estado cambia
     * - Reaccionar a cambios en formularios
     * - Sincronizar múltiples vistas del mismo dato
     */
    subscribe(callback) {
        // Ejecutar callback inmediatamente con valor actual
        callback(this.#value);
        
        // Registrar el callback en el array
        this.#subscribers.push(callback);
        
        /**
         * Retornar función de desuscripción (unsubscribe)
         * 
         * Cuando se llama esta función:
         * - Filtra el array removiendo este callback específico
         * - Usa filter() para crear nuevo array sin el callback
         * - Así evita memory leaks si se olvida desuscribirse
         */
        return () => {
            this.#subscribers = this.#subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Actualiza el estado con un nuevo valor
     * 
     * Comportamiento:
     * 1. Compara nuevo valor con valor actual
     * 2. Si son diferentes: actualiza el estado
     * 3. Notifica a TODOS los suscriptores con el nuevo valor
     * 4. Si son iguales: no hace nada (optimización)
     * 
     * @param {*} newValue - Nuevo valor del estado
     * 
     * Ejemplo:
     * const counter = new ReactivoBehavior(0);
     * 
     * counter.subscribe(value => console.log(value));
     * 
     * counter.next(1); // Salida: 1
     * counter.next(1); // Sin salida (mismo valor)
     * counter.next(2); // Salida: 2
     * 
     * Beneficio de la comparación:
     * - Evita notificaciones innecesarias
     * - Mejora performance si next() se llama frecuentemente
     * - Solo notifica si realmente cambió el valor
     * 
     * Procesos internos:
     * 1. Comparación: this.#value !== newValue
     * 2. Si true: actualiza y notifica
     * 3. forEach() ejecuta cada callback con el nuevo valor
     */
    next(newValue) {
        if (this.#value !== newValue) {
            this.#value = newValue;
            this.#subscribers.forEach(callback => callback(newValue));
        }
    }

    /**
     * Obtiene el valor actual del estado
     * 
     * @returns {*} Valor actual sin modificarlo
     * 
     * Ejemplo:
     * const reactive = new ReactivoBehavior('inicial');
     * const value = reactive.getValue(); // 'inicial'
     * 
     * Casos de uso:
     * - Leer el estado actual sin suscribirse
     * - Obtener valor para decisiones lógicas
     * - Debugear: verificar valor actual
     * 
     * Nota:
     * - Lectura segura: no modifica el estado
     * - Útil cuando solo necesitas el valor puntual
     * - Para reactividad continua: usa subscribe()
     */
    getValue() {
        return this.#value;
    }
}
