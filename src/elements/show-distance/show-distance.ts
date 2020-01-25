import { LitElement, html, property, customElement } from "lit-element";

@customElement('show-distance')
export class ShowDistanceElement extends LitElement {

    @property()
    aveSpeed = 0; /** m/s */

    @property()
    time = 0; /** seconds */

    calculateDistance() {
        const distance = this.aveSpeed * this.time;
        return Math.round(distance/10)/100; 
    }

    render() {
        return html`
            Distance: ${this.calculateDistance()} Km
        `;
    }
}