import { LitElement, html, customElement, css } from "lit-element";
import { bind, memoize } from 'decko';

import './heart-rate/heart-rate';
import './cadence-meter/cadence-meter';

@customElement("trainer-app")
export class TrainerAppElement extends LitElement {
    static styles = [css`
        :host {
            display:block;
        }
    `];

    render() {
        return html`
            <heart-rate .bpm=${100}></heart-rate>

            <cadence-meter .rpm=${70}></cadence-meter>

        `;
    }
}