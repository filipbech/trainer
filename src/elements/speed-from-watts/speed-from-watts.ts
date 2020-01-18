import { LitElement, customElement, property, html } from "lit-element";
import { speedFromPower, kmPrHourFromMetersPrSeconds } from "../../utils/speed-from-power";


@customElement('speed-from-watts')
export class SpeedFromWattsElement extends LitElement {
    @property() watts;
    @property() aveWatts;
    @property() grade = 0;
    
    render() {
        return html`
            Current speed:  ${kmPrHourFromMetersPrSeconds(speedFromPower(this.watts, this.grade, 0, 90))}<br/>
            Ave speed:  ${kmPrHourFromMetersPrSeconds(speedFromPower(this.aveWatts, this.grade, 0, 90))}
        `;
    }
}