import { LitElement, html, customElement, css, property } from "lit-element";
import { bind, memoize } from 'decko';

import './heart-rate/heart-rate';
import './cadence-meter/cadence-meter';
import './power-meter/power-meter';
import './youtube-player/youtube-player';

import { connect, IMeters } from '../utils/connect-sensors';

@customElement("trainer-app")
export class TrainerAppElement extends LitElement {
    static styles = [css`
        :host {
            display:block;
        }

        power-meter {
            position:absolute;
            left:0;
            bottom:var(--zone-percent, 0%);
            transform:translateY(50%);
        }
        power-meter:before {
            content:'';
            display:block;
            border: 10px solid transparent;
            transform:translateY(-50%);
            border-right-color:var(--zoneColor, #e4fc54);
            position:absolute;
            top:50%;
            left:-30px;
        }
        youtube-player {
            width:90vw;
            max-width: calc(100vw - 120px);
        }
        #power-container {
            position:absolute;
            left:97.5%;
            top:42%;
            bottom:20%;
        }
        #container {
            display:inline-block;
            position:relative;
        }
    `];

    cadence: number;
    power: number;
    hr: number;

    @bind
    connect() {
        connect().then(meters => {
            if(typeof this.cadence === 'undefined' && meters.cadenceMeter) {
                this.cadence = 0;
                meters.cadenceMeter!.addListener('cadence', c=>{
                    this.cadence = c;
                });
            }

            if(typeof this.power === 'undefined' && meters.powerMeter) {
                this.power = 0;
                meters.powerMeter!.addListener('power', c=>{
                    this.power = c;
                });
            }

            if(typeof this.hr === 'undefined' && meters.hrMeter) {
                this.hr = 0;
                meters.hrMeter!.addListener('hr', c=>{
                    this.hr = c;
                });
            }
        })
    }

    timeChanged(seconds: number) {
        console.log('seconds', seconds)
    }
    zoneChanged(zone: number) {
        this.style.setProperty('--zone-percent', 10+(10*zone)+'%');
        console.log('zone', zone)
    }


    render() {
        return html`

            <div id="container">
                <youtube-player .videoId=${'bEfCKGBJc6k'} @timeChanged=${e=>this.timeChanged(e.detail)}></youtube-player>
                <div id="power-container">
                    <power-meter .watts=${this.power} .ftp=${250} @zoneChanged=${e=>this.zoneChanged(e.detail.zoneNum)}></power-meter>
                </div>
            </div>

            <br/><br/>
            <button @click=${this.connect}>Connect</button>

            connected: HR ${typeof this.hr === 'number'   ? `👍`: `👎` }, power ${typeof this.power === 'number' ? `👍`: `👎` }, cadence ${typeof this.cadence === 'number' ? `👍`: `👎` }


            <heart-rate .bpm=${this.hr}></heart-rate>

            <cadence-meter .rpm=${this.cadence}></cadence-meter>

        `;
    }
}