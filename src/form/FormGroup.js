/**
 * FORM GROUP - Gestor reactivo de grupo de controles de formulario
 * 
 * Propósito:
 * - Agrupar múltiples controles de formulario bajo una única entidad
 * - Validar el estado colectivo de todos los controles
 * - Extraer valores de todos los controles de forma centralizada
 * - Resetear el estado de todos los controles simultáneamente
 * - Proporcionar acceso individual a controles específicos
 * 
 * Beneficios:
 * - Validación centralizada: verifica todos los controles a la vez
 * - Extracción de datos: obtiene valores de todo el formulario fácilmente
 * - Manejo unificado: resetea el formulario completo en una operación
 * - Reactividad: hereda de ReactivoBehavior para notificaciones automáticas
 * - Encapsulación: controles privados con # para proteger la integridad
 * 
 * Patrones usados:
 * - Composite: agrupa múltiples controles bajo una sola interfaz
 * - Observer: hereda la reactividad de ReactivoBehavior
 * - Private Fields: propiedades privadas con # para encapsulación
 * - Facade: interfaz simplificada para operaciones complejas
 * 
 * Ejemplo de uso:
 * const form = new FormGroup({
 *   email: new FormControl('user@example.com'),
 *   password: new FormControl(''),
 *   username: new FormControl('john_doe')
 * });
 * 
 * if (form.isValid()) {
 *   const data = form.getValue(); // { email: '...', password: '...', username: '...' }
 *   submitForm(data);
 * }
 * 
 * form.reset(); // resetea todos los controles
 */
import { ReactivoBehavior } from '/src/services/general/ReactiveBehavior.js';

export class FormGroup extends ReactivoBehavior {
    /**
     * Objeto que almacena todos los controles del formulario
     * 
     * Estructura:
     * {
     *   fieldName1: FormControl,
     *   fieldName2: FormControl,
     *   fieldName3: FormControl,
     *   ...
     * }
     * 
     * Es privado (#) para evitar accesos directos
     * Solo se modifica a través de los métodos de la clase
     * 
     * @private
     * @type {Object<string, FormControl>}
     */
    #controls = {};

    /**
     * Constructor - Inicializa el FormGroup con un conjunto de controles
     * 
     * @param {Object<string, FormControl>} controls - Objeto con los controles del formulario
     *                                                 Formato: { nombreCampo: FormControl, ... }
     * 
     * Ejemplo:
     * const form = new FormGroup({
     *   email: new FormControl(''),
     *   age: new FormControl(0),
     *   isActive: new FormControl(true)
     * });
     * 
     * Flujo interno:
     * 1. Llamar constructor de ReactivoBehavior con los controles
     * 2. Almacenar controles en #controls para uso interno
     */
    constructor(controls = {}) {
        super(controls);
        this.#controls = controls;
        
        // Suscribirse a cambios de cada control para propagarlos
        Object.values(this.#controls).forEach(control => {
            control.subscribe(() => {
                // Notificar a los suscriptores del FormGroup cuando cambia un control
                this.next(this.#controls);
            });
        });
    }

    /**
     * Obtiene un control específico del formulario por su nombre
     * 
     * @param {string} controlName - Nombre/clave del control a obtener
     * @returns {FormControl|undefined} El control solicitado o undefined si no existe
     * 
     * Ejemplo:
     * const emailControl = form.get('email');
     * const emailValue = emailControl.getValue();
     * 
     * Casos de uso:
     * - Acceder a un control individual
     * - Validar un campo específico
     * - Obtener mensajes de error de un campo
     * - Limpiar o modificar un control específico
     */
    get(controlName) {
        return this.#controls[controlName];
    }

    /**
     * Valida que TODOS los controles del formulario sean válidos
     * 
     * @returns {boolean} true si todos los controles son válidos, false si alguno no lo es
     * 
     * Ejemplo:
     * if (form.isValid()) {
     *   console.log('Formulario correcto, se puede enviar');
     * } else {
     *   console.log('Hay errores en el formulario');
     * }
     * 
     * Lógica interna:
     * - Itera sobre todos los valores (controles) de #controls
     * - Llama isValid() en cada control
     * - every() retorna true solo si TODOS retornan true
     * - Si un control retorna false, el resultado es false inmediatamente
     * 
     * Casos de uso:
     * - Validar antes de enviar el formulario
     * - Habilitar/deshabilitar botón de envío
     * - Mostrar mensaje de validación general
     * - Prevenir acciones si hay errores
     */
    isValid() {
        // Validar todos los controles sin disparar notificaciones
        // Esto evita bucles infinitos
        let allValid = true;
        Object.values(this.#controls).forEach(control => {
            // Validar silenciosamente
            const currentState = control.getValue();
            control.validateSilent ? control.validateSilent() : control.validate();
            if (!control.isValid()) {
                allValid = false;
            }
        });
        return allValid;
    }

    /**
     * Extrae todos los valores de los controles del formulario
     * 
     * @returns {Object<string, *>} Objeto con todos los valores: { nombreCampo: valor, ... }
     * 
     * Ejemplo:
     * const form = new FormGroup({
     *   email: new FormControl('user@example.com'),
     *   password: new FormControl('secreto'),
     *   rememberMe: new FormControl(true)
     * });
     * 
     * const data = form.getValue();
     * // Retorna: { email: 'user@example.com', password: 'secreto', rememberMe: true }
     * 
     * Lógica interna:
     * 1. Crea objeto result vacío
     * 2. Itera sobre cada [key, control] en #controls
     * 3. Para cada control, obtiene su valor: control.getValue().value
     * 4. Asigna el valor en result[key]
     * 5. Retorna el objeto completo
     * 
     * Casos de uso:
     * - Preparar datos para enviar a API
     * - Guardar estado del formulario en localStorage
     * - Comparar valores original vs modificados
     * - Debugear: verificar todos los valores juntos
     * 
     * Nota importante:
     * Asume que control.getValue() retorna un objeto con propiedad .value
     * Ejemplo: { value: 'contenido', dirty: true, errors: {} }
     */
    getValue() {
        const result = {};
        Object.entries(this.#controls).forEach(([key, control]) => {
            result[key] = control.getValue().value;
        });
        return result;
    }

    /**
     * Resetea TODOS los controles del formulario a su estado inicial
     * 
     * Comportamiento de cada control después del reset:
     * - value: vacío ('')
     * - dirty: false (no modificado)
     * - errors: {} (sin errores)
     * 
     * Ejemplo:
     * form.reset();
     * // Ahora: email='', password='', rememberMe='', todos no dirty y sin errores
     * 
     * Lógica interna:
     * 1. Itera sobre todos los controles
     * 2. Para cada control:
     *   a. Obtiene el valor actual: control.getValue()
     *   b. Limpia el contenido: value.value = ''
     *   c. Marca como no modificado: value.dirty = false
     *   d. Limpia errores: value.errors = {}
     *   e. Notifica el cambio: control.next(value)
     * 3. Todos los suscriptores se notifican del cambio
     * 
     * Casos de uso:
     * - Limpiar el formulario después de enviar
     * - Cancelar cambios y volver al estado inicial
     * - Resetear validaciones después de un intento fallido
     * - Permitir al usuario iniciar de nuevo
     * 
     * Nota:
     * Modifica el objeto value internamente antes de notificar
     * Esto asegura que los suscriptores reciban el estado correcto
     */
    reset() {
        Object.values(this.#controls).forEach(control => {
            const value = control.getValue();
            value.value = '';
            value.dirty = false;
            value.errors = {};
            control.next(value);
        });
    }
}