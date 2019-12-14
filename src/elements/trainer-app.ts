import { LitElement, html, customElement, css, property } from "lit-element";
import { bind, memoize } from 'decko';

import './heart-rate/heart-rate';
import './cadence-meter/cadence-meter';
import './power-meter/power-meter';
import './youtube-player/youtube-player';
import './progress-bar/progress-bar';

import { connect, IMeters } from '../utils/connect-sensors';

import { video } from '../video';

interface Settings {
    temp: number; /** temperature (celsius) */
    press: number; /** actual air pressure (millibars, i.e., hectopascals) */
    dew: number; /** dew point (celsius) */
    rp_wr: number; /** Rider Weight (kg) */
    rp_wb: number; /** Bike Weight (kg) */
    ep_g: number; /** Grade % */
    rp_a: number; /**  Frontal area A(m2) */
    rp_cd: number; /** Drag coefficient Cd */
    rp_dtl:number; /** Drivetrain loss Lossdt (%) */
    ep_crr: number; /** Coefficient of rolling resistance Crr */
    ep_rho: number; /** Air density Rho (kg/m3) */
    ftp: number; /** Functional Thresshold Power */
}


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
            transition: bottom 0.5s;
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

    @property()
    cadence: number;

    @property()
    power: number;

    @property()
    hr: number;

    @property()
    seconds = 0;

    @bind
    connect() {
        connect().then((meters:IMeters) => {
            if(typeof this.cadence === 'undefined' && meters.cadenceMeter) {
                this.cadence = 0;
                meters.cadenceMeter!.addListener('cadence', c => {
                    this.cadence = c;
                });
                meters.cadenceMeter!.listen();
            }

            if(typeof this.power === 'undefined' && meters.powerMeter) {
                this.power = 0;
                meters.powerMeter!.addListener('power', p => {
                    this.power = p;
                });
                meters.powerMeter!.listen();
            }

            if(typeof this.hr === 'undefined' && meters.hrMeter) {
                this.hr = 0;
                meters.hrMeter!.addListener('hr', h => {
                    this.hr = h;
                });
                meters.hrMeter!.listen();
            }
        })
    }

    timeChanged(seconds: number) {
        this.seconds = seconds;
    }
    zoneChanged(zone: number) {
        this.style.setProperty('--zone-percent', 10+(10*zone)+'%');
    }

    render() {
        return html`

            <div id="container">
                <youtube-player .videoId=${'bEfCKGBJc6k'} @timeChanged=${e=>this.timeChanged(e.detail)}></youtube-player>
                <progress-bar .sections=${video.sections} .seconds=${this.seconds-video.startTime}></progress-bar>
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