import { LitElement, html, customElement, css, property } from "lit-element";
import { bind, memoize } from 'decko';

import './heart-rate/heart-rate';
import './cadence-meter/cadence-meter';

import { connect } from '../utils/connect-sensors';

@customElement("trainer-app")
export class TrainerAppElement extends LitElement {
    static styles = [css`
        :host {
            display:block;
        }
    `];

    @bind
    connect() {
        connect().then(meters => {
            console.log(meters);
        })
    }

    render() {
        return html`


            <button @click=${this.connect}>Connect</button>

            <heart-rate .bpm=${100}></heart-rate>

            <cadence-meter .rpm=${70}></cadence-meter>

        `;
    }
}