import { LitElement, html, customElement, css, property } from "lit-element";
import { bind, memoize } from 'decko';

import './heart-rate/heart-rate';
import './cadence-meter/cadence-meter';
import './power-meter/power-meter';
import './youtube-player/youtube-player';
import './progress-bar/progress-bar';
import './power-gauge/power-gauge';
import './video-selector/video-selector';

import { connect, IMeters } from '../utils/connect-sensors';
import { IZone, zoneAndScoreFromFtpPercent, zones } from "../utils/zones";

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
    video;

    @property() 
    ftp = 220;

    @property()
    cadence: number;
    

    _power: number;
    set power(v) {
        this._power = v;
        this.ftpPercent = (this.power/this.ftp)*100;
        const zoneAndScore = zoneAndScoreFromFtpPercent(this.ftpPercent);
        
        this.zone = zoneAndScore.zone;
        this.scorePct = zoneAndScore.scorePct
        this.requestUpdate();
    }
    get power(): number {
        return this._power
    }

    @property()
    hr: number;

    @property() 
    scorePct = 0;

    ftpPercent: number;
    zone: IZone;

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

    @bind
    selectVideo(e) {
        this.video = e.detail;
    }

    videoStateChanged(state) {
        if(state === 'ended') {
            this.video = null;
        }
    }

    render() {
        return html`
        <button @click=${this.connect}>Connect a(nother) sensor</button>      

        ${
            typeof this.hr === 'number' 
                ? html`<heart-rate .bpm=${this.hr}></heart-rate>`
                : null
        }
        ${
            typeof this.power === 'number' 
                ? html`<power-gauge .watts=${this.power} .ftp=${this.ftp} .pct=${this.scorePct}></power-gauge>`
                : null
        }
        ${
            typeof this.cadence === 'number' 
                ? html`<cadence-meter .rpm=${this.cadence}></cadence-meter>`
                : null
        }

        ${
            !this.video 
                ? html`<video-selector @videoSelected=${this.selectVideo}></video-selector>`
                : html`
                    <youtube-player .video=${this.video} @stateChanged=${e=>this.videoStateChanged(e.detail)}></youtube-player>
                `
        }
        `;
    }
}