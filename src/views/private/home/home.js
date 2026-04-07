import { BaseComponent } from "../../../services/general/BaseComponent";
import { sidebarService } from "../../../services/general/sidebar.service.js";

class HomeComponent extends BaseComponent{
    async connectedCallback(){
        await this.loadTemplate('/src/views/private/home/home.html', '#home-template');
        this.setupSidebarOptions();
    }

    setupSidebarOptions() {
        // Configurar las opciones del sidebar con rutas y emojis
        sidebarService.setOptions([
            { label: 'Home', route: '/home', icon: '🏠' },
            { label: 'Usuarios', route: '/users', icon: '👥' },
            { label: 'Configuración', route: '/settings', icon: '⚙️' },
            { label: 'Reportes', route: '/reports', icon: '📊' }
        ]);
    }
}

customElements.define('home-component', HomeComponent);