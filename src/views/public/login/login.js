import { BaseComponent } from "../../../services/general/BaseComponent.js";
import { Router } from "../../../router/router.js";
import { loadingService } from "../../../services/general/loading.service.js";
import { toastService } from "../../../services/general/toast.service.js";
import { loginService } from "../../../services/api/login.service.js";
import { FormGroup } from "../../../form/FormGroup.js";
import { FormControl } from "../../../form/FormControl.js";
import { Validators } from "../../../form/Validators.js";
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
     * Inicializa el FormGroup con los controles del formulario
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

        // Suscribirse a cambios del formulario
        this.loginForm.subscribe(() => {
            this.validateForm();
            this.updateErrorMessages();
        });

        // Validar inicial y mostrar errores
        this.validateForm();
        this.updateErrorMessages();
    }

    /**
     * Actualiza los mensajes de error en los inputs
     */
    updateErrorMessages() {
        const emailControl = this.loginForm.get('email');
        const passwordControl = this.loginForm.get('password');

        // ===== EMAIL INPUT =====
        const emailInputElement = this.emailInput.querySelector('input');
        
        // Limpiar errores previos
        this.emailInput.querySelectorAll('[slot="error"]').forEach(el => el.remove());
        
        // Remover borde rojo previo
        if (emailInputElement) {
            emailInputElement.classList.remove('border-red-500', 'dark:border-red-500');
        }

        // Mostrar errores de email
        if (emailControl.hasErrors() && emailControl.isTouched()) {
            const errors = emailControl.getErrors();
            
            // Agregar borde rojo
            if (emailInputElement) {
                emailInputElement.classList.add('border-red-500', 'dark:border-red-500');
            }
            
            Object.keys(errors).forEach(errorType => {
                const errorDiv = document.createElement('span');
                errorDiv.slot = 'error';
                errorDiv.className = 'text-red-500 text-sm';
                
                if (errorType === 'required') {
                  errorDiv.textContent = 'Email requerido';
                } else if (errorType === 'email') {
                  errorDiv.textContent = 'Email inválido';
                }
                
                this.emailInput.appendChild(errorDiv);
            });
        }

        // ===== PASSWORD INPUT =====
        const passwordInputElement = this.passwordInput.querySelector('input');
        
        // Limpiar errores previos
        this.passwordInput.querySelectorAll('[slot="error"]').forEach(el => el.remove());
        
        // Remover borde rojo previo
        if (passwordInputElement) {
            passwordInputElement.classList.remove('border-red-500', 'dark:border-red-500');
        }

        // Mostrar errores de password
        if (passwordControl.hasErrors() && passwordControl.isTouched()) {
            const errors = passwordControl.getErrors();
            
            // Agregar borde rojo
            if (passwordInputElement) {
                passwordInputElement.classList.add('border-red-500', 'dark:border-red-500');
            }
            
            Object.keys(errors).forEach(errorType => {
                const errorDiv = document.createElement('span');
                errorDiv.slot = 'error';
                errorDiv.className = 'text-red-500 text-sm';
                
                if (errorType === 'required') {
                  errorDiv.textContent = 'Contraseña requerida';
                } else if (errorType === 'minLength') {
                  errorDiv.textContent = 'Mínimo 6 caracteres';
                }
                
                this.passwordInput.appendChild(errorDiv);
            });
        }
    }

    setupEventListeners() {
        // Validar formulario cuando cambian los inputs
        this.listen(this.emailInput, 'input-change', (event) => {
            this.loginForm.get('email').setValue(event.detail.value);
        });

        this.listen(this.emailInput, 'input-blur', () => {
            this.loginForm.get('email').markAsTouched();
            this.updateErrorMessages();
        });
        
        this.listen(this.passwordInput, 'input-change', (event) => {
            this.loginForm.get('password').setValue(event.detail.value);
        });

        this.listen(this.passwordInput, 'input-blur', () => {
            this.loginForm.get('password').markAsTouched();
            this.updateErrorMessages();
        });

        // Manejar click del botón
        this.listen(this.submitBtn, 'button-click', () => {
            this.handleSubmit();
        });

        // Manejar submit del formulario (si se envía por Enter en el input)
        this.listen(this.form, 'submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    validateForm() {
        const isFormValid = this.loginForm.isValid();
        this.submitBtn.setDisabled(!isFormValid);
        return isFormValid;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        this.submitBtn.setLoading(true);
        
        console.log('📍 Mostrando loader...');
        loadingService.show();
        loadingService.setLoadingText('Iniciando sesión...');

        try {
            const formData = this.loginForm.getValue();

            // Usar el servicio de login
            const response = await loginService.login(formData.email, formData.password);

            if (response.success) {
                this.submitBtn.setVariant('success');
                
                // Mostrar toast de éxito
                toastService.success(
                    'Bienvenido',
                    `Sesión iniciada como ${response.user.role}`,
                    3000
                );
                
                console.log('✓ Login exitoso:', response);
                
                // Limpiar formulario
                this.loginForm.reset();
                
                // Mantener loader mientras navega
                setTimeout(() => {
                    console.log('🔄 Navegando a /home...');
                    this.router.navigate('/home');
                    // El loader se ocultará cuando el router termine de cargar
                    setTimeout(() => {
                        console.log('📍 Ocultando loader...');
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
            
            console.log('❌ Error:', error.message);
            
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
