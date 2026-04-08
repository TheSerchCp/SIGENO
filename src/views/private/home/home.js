import { BaseComponent } from "../../../services/general/BaseComponent";

class HomeComponent extends BaseComponent{
    async connectedCallback(){
        await this.loadTemplate('/src/views/private/home/home.html', '#home-template');
    }
}

customElements.define('home-component', HomeComponent);