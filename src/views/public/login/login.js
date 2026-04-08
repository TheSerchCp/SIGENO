import { BaseComponent } from "../../../services/general/BaseComponent.js";
import { Router } from "../../../router/router.js";
import { loadingService } from "../../../services/general/loading.service.js";
import { toastService } from "../../../services/general/toast.service.js";
import { loginService } from "../../../services/api/login.service.js";
import { FormGroup } from "../../../form/FormGroup.js";
import { FormControl } from "../../../form/FormControl.js";
import { Validators } from "../../../form/Validators.js";
import { FormService } from "../../../services/form/FormService.js";
import '../sharedComponents.js';

class LoginComponent extends BaseComponent {
    async connectedCallback() {
        await this.loadTemplate('/src/views/public/login/login.html', '#login-template');
        this.cacheDom();
        this.router = window.appRouter || new Router(document.querySelector('#router-outlet'));
        this.initializeForm();
        this.setupEventListeners();
    }

    cacheDom() {
        this.form = this.querySelector('#loginForm');
        this.emailInput = this.querySelector('#emailInput');
        this.passwordInput = this.querySelector('#passwordInput');
        this.submitBtn = this.querySelector('#submitBtn');
    }

    /**
     * Inicializa el FormGroup y FormService
     */
    initializeForm() {
        this.loginForm = new FormGroup({
            email: new FormControl('', [
                Validators.required,
                Validators.email
            ]),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(6)
            ])
        });

        // Crear servicio de formulario con configuración de campos y mensajes
        this.formService = new FormService(this.loginForm, {
            email: {
                element: this.emailInput,
                errors: {
                    required: 'Email requerido',
                    email: 'Email inválido'
                }
            },
            password: {
                element: this.passwordInput,
                errors: {
                    required: 'Contraseña requerida',
                    minLength: 'Mínimo 6 caracteres'
                }
            }
        });

        // Configurar validación automática
        this.formService.setupValidation();
        this.formService.validateAndUpdateUI(this.submitBtn);
    }

    setupEventListeners() {
        // Escuchar cambios en los inputs
        this.listen(this.emailInput, 'input-change', (event) => {
            this.formService.setFieldValue('email', event.detail.value);
        });

        this.listen(this.emailInput, 'input-blur', () => {
            this.formService.markAsTouched('email');
        });

        this.listen(this.passwordInput, 'input-change', (event) => {
            this.formService.setFieldValue('password', event.detail.value);
        });

        this.listen(this.passwordInput, 'input-blur', () => {
            this.formService.markAsTouched('password');
        });

        // Manejar click del botón
        this.listen(this.submitBtn, 'button-click', () => {
            this.handleSubmit();
        });

        // Manejar submit del formulario (si se envía por Enter)
        this.listen(this.form, 'submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        if (!this.formService.isFormValid()) {
            this.formService.markAllAsTouched();
            return;
        }

        this.submitBtn.setLoading(true);

        loadingService.show();
        loadingService.setLoadingText('Iniciando sesión...');

        try {
            const formData = this.formService.getFormValues();

            // Usar el servicio de login
            const response = await loginService.login(formData.email, formData.password);

            if (response.success) {
                // Mostrar toast de éxito
                toastService.success(
                    'Bienvenido',
                    `Sesión iniciada como ${response.user.role}`,
                    3000
                );

                console.log('✓ Login exitoso:', response);

                // Limpiar formulario
                this.formService.resetForm();

                // Mantener loader mientras navega
                setTimeout(() => {
                    this.router.navigate('/home');
                    // El loader se ocultará cuando el router termine de cargar
                    setTimeout(() => {
                        loadingService.hide();
                    }, 500);
                }, 1000);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.submitBtn.setVariant('danger');

            // Mostrar toast de error
            toastService.error(
                'Error en el inicio de sesión',
                error.message || 'Verifique sus credenciales',
                5000
            );

            loadingService.hide();
            // Volver al estado normal después de 2 segundos
            setTimeout(() => {
                this.submitBtn.setVariant('primary');
            }, 2000);
        } finally {
            this.submitBtn.setLoading(false);
        }
    }
}

customElements.define('login-component', LoginComponent);
