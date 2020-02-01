import { LitElement, customElement, property, html, css } from "lit-element";
import { kmPrHourFromMetersPrSeconds } from "../../utils/speed-from-power";

@customElement('speed-o-meter')
export class SpeedFromWattsElement extends LitElement {
    @property() speed;
    @property() avgSpeed;

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

    displaySpeed(speed) {
        return Math.round(kmPrHourFromMetersPrSeconds(speed)*10)/10;
    }

    render() {
        return html`
            ${this.displaySpeed(this.speed)}Km/h
            <span>${this.displaySpeed(this.avgSpeed)}km/h</span>
        `;
    }
}