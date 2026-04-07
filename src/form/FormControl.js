import { ReactivoBehavior } from '/src/services/general/ReactiveBehavior.js';

/**
 * FORM CONTROL - Gestor reactivo de control de formulario con validación
 * 
 * Propósito:
 * - Mantener el estado de un control de formulario (valor, errores, estados)
 * - Ejecutar validadores personalizados automáticamente
 * - Gestionar estados de validez, suciedad y contacto del control
 * - Notificar cambios a través del patrón ReactiveBehavior
 * 
 * Beneficios:
 * - Validación automática: se ejecuta con cada cambio de valor
 * - Estado completo: valor, errores, dirty, touched en un objeto
 * - Validadores reutilizables: funciones personalizadas fáciles de componer
 * - Reactividad: cambios en el control se propagan automáticamente
 * - Encapsulación: acceso controlado a validadores y errores
 * 
 * Patrones usados:
 * - ReactiveBehavior: hereda para reactividad y notificación de suscriptores
 * - Private Fields: validadores y errores con # para privacidad
 * - Chain of Responsibility: múltiples validadores se evalúan en orden
 * - Validator Pattern: funciones validadoras puras e independientes
 * 
 * Estructura del estado:
 * {
 *   value: string,      // Valor actual del control
 *   errors: object,     // Objeto con errores encontrados {nombreError: mensaje}
 *   dirty: boolean,     // true si el usuario ha modificado el valor
 *   touched: boolean    // true si el usuario ha interactuado con el control
 * }
 * 
 * Ejemplo de uso:
 * const emailValidator = (value) => {
 *   if (!value.includes('@')) return { invalidEmail: 'Email inválido' };
 *   return null;
 * };
 * 
 * const control = new FormControl('', [emailValidator]);
 * control.subscribe(state => console.log(state));
 * 
 * control.setValue('user@example.com');
 * // {value: 'user@example.com', errors: {}, dirty: true, touched: false}
 * 
 * console.log(control.isValid()); // true
 * console.log(control.getError('invalidEmail')); // undefined
 */
export class FormControl extends ReactivoBehavior {
    /**
     * Array de funciones validadoras
     * 
     * Estructura:
     * [
     *   (value) => { if (condition) return { errorKey: 'mensaje' } },
     *   (value) => { if (condition) return { anotherError: 'otro mensaje' } },
     *   ...
     * ]
     * 
     * Características:
     * - Cada validador retorna null si es válido
     * - Retorna objeto con errores si falla: { errorKey: descripción }
     * - Se ejecutan secuencialmente en validate()
     * - Son funciones puras sin efectos secundarios
     * 
     * @private
     * @type {Array<Function>}
     */
    #validators = [];

    /**
     * Objeto que almacena los errores encontrados
     * 
     * Estructura:
     * {
     *   minLength: 'Mínimo 5 caracteres',
     *   pattern: 'Formato inválido',
     *   required: 'Este campo es obligatorio'
     * }
     * 
     * Se reinicia en cada validate()
     * Se actualiza con errores de todos los validadores
     * Se sincroniza con el estado ReactIvo
     * 
     * @private
     * @type {Object<string, string>}
     */
    #errors = {};

    /**
     * Constructor - Inicializa el FormControl con valor y validadores
     * 
     * @param {string} value - Valor inicial del control (por defecto: '')
     *                        Ejemplo: '', 'usuario@email.com', '123'
     * 
     * @param {Array<Function>} validators - Array de funciones validadoras
     *                                       Cada validador: (value) => null | {errorKey: msg}
     *                                       Por defecto: []
     * 
     * Estado inicial:
     * {
     *   value: string,      // El valor pasado
     *   errors: {},         // Sin errores inicialmente
     *   dirty: false,       // No modificado aún
     *   touched: false      // No interactuado aún
     * }
     * 
     * Ejemplo:
     * const control1 = new FormControl();
     * // {value: '', errors: {}, dirty: false, touched: false}
     * 
     * const control2 = new FormControl('admin@example.com', [emailValidator, requiredValidator]);
     * 
     * const control3 = new FormControl('', [minLengthValidator(5), patternValidator(/\d/)]);
     */
    constructor(value = '', validators = []) {
        super({ value, errors: {}, dirty: false, touched: false });
        this.#validators = validators;
    }

    /**
     * Establece un nuevo valor y ejecuta validación
     * 
     * Proceso:
     * 1. Obtiene el estado actual
     * 2. Asigna el nuevo valor
     * 3. Marca dirty = true (usuario modificó)
     * 4. Ejecuta validación automática
     * 5. Notifica a suscriptores con el estado actualizado
     * 
     * @param {string} value - Nuevo valor del control
     * 
     * Estado después:
     * {
     *   value: string,      // El nuevo valor
     *   errors: {...},      // Errores de validación (si los hay)
     *   dirty: true,        // Siempre true después de setValue
     *   touched: false      // Se actualiza solo con onBlur
     * }
     * 
     * Ejemplo:
     * const control = new FormControl('', [minLengthValidator(5)]);
     * 
     * control.setValue('ab');
     * // {value: 'ab', errors: {minLength: 'Mínimo 5 caracteres'}, dirty: true, touched: false}
     * 
     * control.setValue('abcdefgh');
     * // {value: 'abcdefgh', errors: {}, dirty: true, touched: false}
     * 
     * Casos de uso:
     * - Usuario escribe en input (onChange)
     * - Programáticamente se asigna valor inicial
     * - Reset del formulario con nuevo valor
     */
    setValue(value) {
        const current = this.getValue();
        current.value = value;
        current.dirty = true;
        this.validate();
        this.next(current);
    }

    /**
     * Ejecuta todos los validadores y acumula errores
     * 
     * Proceso:
     * 1. Limpia errores anteriores
     * 2. Obtiene el valor actual
     * 3. Itera sobre cada validador
     * 4. Si un validador retorna error: lo merged en #errors
     * 5. Actualiza errores en el estado reactivo
     * 6. Retorna si es válido (sin errores)
     * 
     * Característica de Chain of Responsibility:
     * - Se ejecutan TODOS los validadores (no detiene en el primero)
     * - Acumula múltiples errores en un mismo ciclo
     * - Permite al usuario ver todos los problemas a la vez
     * 
     * @returns {boolean} true si no hay errores, false si hay algún error
     * 
     * Flujo interno:
     * - Validador 1: retorna {error1: 'msg'} → Object.assign
     * - Validador 2: retorna null → sin cambios
     * - Validador 3: retorna {error3: 'msg'} → Object.assign
     * - Resultado: {error1: 'msg', error3: 'msg'}
     * 
     * Ejemplo:
     * const control = new FormControl('ab', [
     *   (v) => v.length < 5 ? {minLength: 'Mínimo 5'} : null,
     *   (v) => !/\d/.test(v) ? {noDigits: 'Debe contener números'} : null
     * ]);
     * 
     * const isValid = control.validate();
     * // isValid: false
     * // this.#errors: {minLength: 'Mínimo 5', noDigits: 'Debe contener números'}
     * 
     * Casos de uso:
     * - Validar antes de enviar formulario
     * - Mostrar todos los errores simultáneamente
     * - Validar al perder el foco (onBlur)
     */
    validate() {
        this.#errors = {};
        const value = this.getValue().value;

        for (const validator of this.#validators) {
            const error = validator(value);
            if (error) {
                Object.assign(this.#errors, error);
            }
        }

        this.getValue().errors = this.#errors;
        return Object.keys(this.#errors).length === 0;
    }

    /**
     * Verifica si el control es válido (sin errores)
     * 
     * @returns {boolean} true si no hay errores, false si hay alguno
     * 
     * Nota: Solo usa el estado actual de #errors
     *       No ejecuta validación nuevamente
     *       Si necesitas validar antes: llama a validate()
     * 
     * Ejemplo:
     * const control = new FormControl('valid@email.com', [emailValidator]);
     * control.validate(); // ejecuta validadores
     * 
     * if (control.isValid()) {
     *   // Enviar formulario
     * } else {
     *   // Mostrar errores al usuario
     * }
     * 
     * Casos de uso:
     * - Habilitar/deshabilitar botón de submit
     * - Verificar validez antes de procesar
     * - Renderizar mensaje de éxito/error
     */
    isValid() {
        return Object.keys(this.#errors).length === 0;
    }

    /**
     * Obtiene un error específico por su clave
     * 
     * @param {string} errorKey - Clave del error a buscar
     *                           Ejemplo: 'required', 'minLength', 'pattern', 'invalidEmail'
     * 
     * @returns {string|undefined} Mensaje del error si existe, undefined si no
     * 
     * Ejemplo:
     * const control = new FormControl('ab', [minLengthValidator(5)]);
     * control.validate();
     * 
     * const msg = control.getError('minLength');
     * // msg: 'Mínimo 5 caracteres'
     * 
     * const msg2 = control.getError('pattern');
     * // msg2: undefined (este error no existe)
     * 
     * Casos de uso:
     * - Mostrar mensaje de error específico en el HTML
     * - Validar existencia de error particular: if (control.getError('required'))
     * - Formatear mensajes de error en la UI
     * - Casos condicionales basados en tipo de error
     * 
     * Ventaja:
     * - Acceso específico sin exponer objeto completo de errores
     * - Encapsulación: #errors permanece privado
     * - Fácil consumo en templates/componentes
     */
    getError(errorKey) {
        return this.#errors[errorKey];
    }

    /**
     * Obtiene todos los errores
     * @returns {Object}
     */
    getErrors() {
        return this.#errors;
    }

    /**
     * Verifica si el control tiene errores
     * @returns {boolean}
     */
    hasErrors() {
        return !this.isValid();
    }

    /**
     * Marca el control como tocado
     */
    markAsTouched() {
        const current = this.getValue();
        current.touched = true;
        this.next(current);
    }

    /**
     * Obtiene el estado de touched
     * @returns {boolean}
     */
    isTouched() {
        return this.getValue().touched;
    }
}
 