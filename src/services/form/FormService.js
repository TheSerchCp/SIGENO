/**
 * FORM SERVICE - Servicio genérico para validación y manejo de errores
 * 
 * Propósito:
 * - Centralizar lógica de validación para cualquier formulario
 * - Mostrar/limpiar errores de forma consistente
 * - Evitar repetir código en múltiples componentes
 * - Sincronizar validación con UI (botones, mensajes)
 * 
 * Beneficios:
 * - DRY: una sola implementación para todos los formularios
 * - Consistencia: todos los formularios se comportan igual
 * - Mantenibilidad: cambios en un lugar afectan todos los formularios
 * - Reutilizable: funciona con cualquier FormGroup
 * 
 * Ejemplo de uso:
 * const formService = new FormService(loginForm, {
 *   email: { 
 *     element: emailInput,
 *     errors: { required: 'Email requerido', email: 'Email inválido' }
 *   },
 *   password: {
 *     element: passwordInput,
 *     errors: { required: 'Contraseña requerida', minLength: 'Mínimo 6 caracteres' }
 *   }
 * });
 * 
 * formService.setupValidation();
 * formService.validateAndUpdateUI(submitBtn);
 */
export class FormService {
    /**
     * Constructor - Inicializa el servicio con un FormGroup y configuración de campos
     * 
     * @param {FormGroup} formGroup - El FormGroup a validar
     * @param {Object} fieldsConfig - Configuración de campos
     * 
     * Estructura de fieldsConfig:
     * {
     *   fieldName: {
     *     element: HTMLElement,           // Elemento del componente (input-component, etc)
     *     errors: { errorType: 'mensaje' }  // Mapeo de errores a mensajes
     *   },
     *   ...
     * }
     */
    constructor(formGroup, fieldsConfig) {
        this.formGroup = formGroup;
        this.fieldsConfig = fieldsConfig;
        this.submitBtn = null;
    }

    /**
     * Configura las suscripciones y listeners del formulario
     */
    setupValidation() {
        // Suscribirse a cambios del formulario
        this.formGroup.subscribe(() => {
            this.updateAllErrorMessages();
            if (this.submitBtn) {
                this.validateAndUpdateUI(this.submitBtn);
            }
        });
    }

    /**
     * Valida el formulario y actualiza el estado del botón submit
     * 
     * @param {Element} submitBtn - Elemento del botón submit
     * @returns {boolean} true si el formulario es válido
     */
    validateAndUpdateUI(submitBtn) {
        this.submitBtn = submitBtn;
        const isFormValid = this.formGroup.isValid();
        if (submitBtn && submitBtn.setDisabled) {
            submitBtn.setDisabled(!isFormValid);
        }
        return isFormValid;
    }

    /**
     * Actualiza todos los mensajes de error de los campos
     */
    updateAllErrorMessages() {
        Object.entries(this.fieldsConfig).forEach(([fieldName, config]) => {
            this.updateFieldErrors(fieldName, config);
        });
    }

    /**
     * Actualiza los mensajes de error para un campo específico
     * 
     * @param {string} fieldName - Nombre del campo en el FormGroup
     * @param {Object} config - Configuración del campo { element, errors }
     */
    updateFieldErrors(fieldName, config) {
        const control = this.formGroup.get(fieldName);
        const { element, errors: errorMessages } = config;

        if (!control || !element) return;

        // Obtener el input dentro del elemento
        const inputElement = element.querySelector('input');

        // Limpiar errores previos
        element.querySelectorAll('[slot="error"]').forEach(el => el.remove());

        // Remover borde rojo previo
        if (inputElement) {
            inputElement.classList.remove('border-red-500', 'dark:border-red-500');
        }

        // Mostrar errores si el control tiene errores y ha sido tocado
        if (control.hasErrors() && control.isTouched()) {
            const errors = control.getErrors();

            // Agregar borde rojo
            if (inputElement) {
                inputElement.classList.add('border-red-500', 'dark:border-red-500');
            }

            // Mostrar solo el primer error
            const firstErrorType = Object.keys(errors)[0];
            if (firstErrorType && errorMessages[firstErrorType]) {
                const errorDiv = document.createElement('span');
                errorDiv.slot = 'error';
                errorDiv.className = 'text-red-500 text-sm';
                errorDiv.textContent = errorMessages[firstErrorType];

                element.appendChild(errorDiv);
            }
        }
    }

    /**
     * Marca un campo como tocado (generalmente al perder el foco)
     * 
     * @param {string} fieldName - Nombre del campo
     */
    markAsTouched(fieldName) {
        const control = this.formGroup.get(fieldName);
        if (control) {
            control.markAsTouched();
        }
    }

    /**
     * Marca todos los campos como tocados
     */
    markAllAsTouched() {
        Object.keys(this.fieldsConfig).forEach(fieldName => {
            this.markAsTouched(fieldName);
        });
    }

    /**
     * Establece el valor de un campo
     * 
     * @param {string} fieldName - Nombre del campo
     * @param {*} value - Nuevo valor
     */
    setFieldValue(fieldName, value) {
        const control = this.formGroup.get(fieldName);
        if (control) {
            control.setValue(value);
        }
    }

    /**
     * Obtiene el valor de un campo
     * 
     * @param {string} fieldName - Nombre del campo
     * @returns {*} Valor actual del control
     */
    getFieldValue(fieldName) {
        const control = this.formGroup.get(fieldName);
        return control ? control.getValue().value : null;
    }

    /**
     * Obtiene todos los valores del formulario
     * 
     * @returns {Object} Objeto con todos los valores
     */
    getFormValues() {
        return this.formGroup.getValue();
    }

    /**
     * Resetea el formulario
     */
    resetForm() {
        this.formGroup.reset();
        this.updateAllErrorMessages();
    }

    /**
     * Verifica si el formulario es válido
     * 
     * @returns {boolean} true si es válido
     */
    isFormValid() {
        return this.formGroup.isValid();
    }

    /**
     * Obtiene errores específicos de un campo
     * 
     * @param {string} fieldName - Nombre del campo
     * @returns {Object} Objeto con los errores
     */
    getFieldErrors(fieldName) {
        const control = this.formGroup.get(fieldName);
        return control ? control.getErrors() : {};
    }
}
