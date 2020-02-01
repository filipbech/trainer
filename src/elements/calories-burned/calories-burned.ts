import { LitElement, html, property, customElement } from "lit-element";
import { caloriesFromWattSeconds } from "../../utils/calories-from-wattseconds";

@customElement("calories-burned")
export class CaloriesBurnedElement extends LitElement {
    @property() 
    seconds = 0;

    avgPower = 0;

    render() {
        return html`
            Kcal: ${caloriesFromWattSeconds(this.avgPower, this.seconds)}
        `;
    }
}