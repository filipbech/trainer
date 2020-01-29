import { LitElement, html, property, customElement, css } from "lit-element";
import { styleMap } from 'lit-html/directives/style-map';
import { ISection } from "../../video";
import { TimeFormat } from "../../utils/time-format";
import { zones } from "../../utils/zones";

@customElement("current-section")
export class CurrentSectionEement extends LitElement {

    static styles = [css`
        :host {
            display:block;
            color:var(--zone-color, #FFF);
        }
    `];

    @property()
    section: ISection;

    get time() {
        return TimeFormat.renderTime(this.section.duration*1000);
    }

    get zone() {
        return zones.find(zone=>zone.num ===this.section.effort);
    }


    render() {
        return html`
            ${this.section && html`
                <div style=${styleMap({ '--zone-color': this.zone ? this.zone.color : '' })}>
                    Effort: ${this.section.effort}<br/>
                    ${this.section.cadence} <beep-metronome .bpm=${this.section.cadence}></beep-metronome><br/>
                    ${this.time}
            </div>
            `}
        `;
    }
}