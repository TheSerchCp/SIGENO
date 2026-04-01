import { BaseComponent } from "../../../services/general/BaseComponent.js";
import { Router } from "../../../router/router.js";
import { loadingService } from "../../../services/general/loading.service.js";
import '../../../components/loader/loader.js';
import '../sharedComponents.js';

class LoginComponent extends BaseComponent {
    async connectedCallback() {
        // Agregar el loader al body si no existe
        if (!document.querySelector('app-loader')) {
            const loader = document.createElement('app-loader');
            document.body.insertBefore(loader, document.body.firstChild);
            console.log('✓ Loader agregado al body');
        }

        await this.loadTemplate('/src/views/public/login/login.html', '#login-template');
        this.cacheDom();
        this.router = window.appRouter || new Router(document.querySelector('#router-outlet'));
        this.setupEventListeners();
    }

    cacheDom() {
        this.form = this.querySelector('#loginForm');
        this.emailInput = this.querySelector('#emailInput');
        this.passwordInput = this.querySelector('#passwordInput');
        this.submitBtn = this.querySelector('#submitBtn');
        this.successMessage = this.querySelector('#successMessage');
        this.errorMessage = this.querySelector('#errorMessage');
        this.errorText = this.querySelector('#errorText');
    }

    setupEventListeners() {
        // Validar formulario cuando cambian los inputs
        this.listen(this.emailInput, 'input-change', () => this.validateForm());
        this.listen(this.passwordInput, 'input-change', () => this.validateForm());

        // Manejar click del botón
        this.listen(this.submitBtn, 'button-click', (e) => {
            this.handleSubmit();
        });

        // Manejar submit del formulario (si se envía por Enter en el input)
        this.listen(this.form, 'submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Limpiar mensajes de error cuando el usuario edita
        this.listen(this.emailInput, 'input-focus', () => this.clearMessages());
        this.listen(this.passwordInput, 'input-focus', () => this.clearMessages());
    }

    validateForm() {
        const emailValid = this.emailInput.validate();
        const passwordValid = this.passwordInput.getValue().length >= 6;
        
        const isFormValid = emailValid && passwordValid;
        this.submitBtn.setDisabled(!isFormValid);
        
        return isFormValid;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        this.clearMessages();
        this.submitBtn.setLoading(true);
        
        console.log('📍 Mostrando loader...');
        loadingService.show();

        try {
            const formData = {
                email: this.emailInput.getValue(),
                password: this.passwordInput.getValue()
            };

            // Simular llamada a API
            const response = await this.simulateLogin(formData);

            if (response.success) {
                this.submitBtn.setVariant('success');
                this.successMessage.classList.remove('hidden');
                
                console.log('✓ Login exitoso:', response);
                
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
            this.errorMessage.classList.remove('hidden');
            this.errorText.textContent = error.message || 'Error en el inicio de sesión';
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

    clearMessages() {
        this.successMessage.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
    }

    // Simular llamada a API
    simulateLogin(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Aceptar cualquier email y contraseña para demo
                if (data.email && data.password) {
                    resolve({
                        success: true,
                        message: 'Bienvenido',
                        user: { email: data.email }
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Credenciales inválidas'
                    });
                }
            }, 1500);
        });
    }
}

customElements.define('login-component', LoginComponent);