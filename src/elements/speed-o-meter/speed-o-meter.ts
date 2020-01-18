import { LitElement, customElement, property, html, css } from "lit-element";

@customElement('speed-o-meter')
export class SpeedFromWattsElement extends LitElement {
    @property() speed;
    @property() aveSpeed;

    static styles = [css`
        :host {
            display:inline-block;
            font-size:20px;
        }
        span {
            font-size:15px;
            display:block;
        }
    `];
    
    render() {
        return html`
            ${this.speed}Km/h
            <span>${this.aveSpeed}km/h</span>
        `;
    }
}