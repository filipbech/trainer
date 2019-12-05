import { LitElement, html, customElement, css } from "lit-element";
import { bind, memoize } from 'decko';

@customElement("trainer-app")
export class TrainerAppElement extends LitElement {
    static styles = [css`
        :host {
            display:block;
        }
    `];

    render() {
        return html`
            trainer here...
        `;
    }
}