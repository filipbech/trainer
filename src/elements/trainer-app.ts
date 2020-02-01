import { LitElement, html, customElement, css, property } from "lit-element";
import { bind,  } from 'decko';
import { connect, IMeters } from '../utils/connect-sensors';
import { IZone, zoneAndScoreFromFtpPercent } from "../utils/zones";
import { speedFromPower } from "../utils/speed-from-power";

import './heart-rate/heart-rate';
import './cadence-meter/cadence-meter';
import './power-meter/power-meter';
import './youtube-player/youtube-player';
import './progress-bar/progress-bar';
import './power-gauge/power-gauge';
import './video-selector/video-selector';
import './speed-o-meter/speed-o-meter';
import './elapsed-time/elapsed-time'
import { ElapsedTimeElement } from "./elapsed-time/elapsed-time";
import "./show-distance/show-distance"
import './beep-metronome/beep-metronome';
import { ISection } from "../video";
import './current-section/current-section';
import './calories-burned/calories-burned';

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

    rider = {
        weight: 90
    };

    @property()
    cadence: number;
    
    @property()
    avgCadence: number;

    _avgPower:number;
    @property()
    set avgPower(newValue) {
        this._avgPower = newValue;
        this.avgSpeed = speedFromPower(this.avgPower, this.grade, 0, this.rider.weight)
    }
    get avgPower() {
        return this._avgPower;
    }

    @property()
    avgSpeed: number;

    @property()
    avgHr: number;

    @property()
    speed: number;

    _power: number;
    set power(v) {
        this._power = v;
        this.ftpPercent = (this.power/this.ftp)*100;
        const zoneAndScore = zoneAndScoreFromFtpPercent(this.ftpPercent);
        this.speed = speedFromPower(this.power, this.grade, 0, this.rider.weight);
        this.zone = zoneAndScore.zone;
        this.scorePct = zoneAndScore.scorePct
        this.requestUpdate();
    }
    get power(): number {
        return this._power
    }

    @property()
    grade = 0;

    @property()
    hr: number;

    @property() 
    scorePct = 0;

    state = {
        running: true
    };

    @property()
    section: ISection;

    @bind
    sectionChanged(e) {
        this.section = e.detail;
    }

    get bpm() {
        return this.section ? this.section.cadence : null;
    }

    ftpPercent: number;
    zone: IZone;

    @property()
    time = 0;
    
    @bind
    connect() {
        connect().then((meters:IMeters) => {
            if(typeof this.cadence === 'undefined' && meters.cadenceMeter) {
                this.cadence = 0;
                meters.cadenceMeter!.addListener('cadence', cadence => {
                    this.cadence = cadence;
                });
                meters.cadenceMeter!.addListener('avgCadence', avgCadence => {
                    this.avgCadence = avgCadence;
                });
                meters.cadenceMeter!.listenWithState(this.state);
            }

            if(typeof this.power === 'undefined' && meters.powerMeter) {
                this.power = 0;
                meters.powerMeter!.addListener('power', power => {
                    this.power = power;
                });
                meters.powerMeter!.addListener('avgPower', avgPower => {
                    this.avgPower = avgPower;
                });
                meters.powerMeter!.listenWithState(this.state);
            }

            if(typeof this.hr === 'undefined' && meters.hrMeter) {
                this.hr = 0;
                meters.hrMeter!.addListener('hr', hr => {
                    this.hr = hr;
                });
                meters.hrMeter!.addListener('avgHr', avgHr => {
                    this.avgHr = avgHr;
                });
                meters.hrMeter!.listenWithState(this.state);
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
        if(state === 'playing') {
            const timer = this.shadowRoot && this.shadowRoot.getElementById('timer') as ElapsedTimeElement;
            timer && timer.start();
        }
    }

    @bind
    playPause(running) {
        this.state.running = running.detail;
    }

    @bind
    updateTime(t) {
        this.time = t.detail;
    }

    render() {
        return html`
        <button @click=${this.connect}>Connect a(nother) sensor</button>      

        <elapsed-time id="timer" @playpause=${this.playPause} @time=${this.updateTime}></elapsed-time>

        ${
            typeof this.hr === 'number' 
                ? html`<heart-rate .bpm=${this.hr} .avgBpm=${this.avgHr}></heart-rate>`
                : null
        }
        ${
            typeof this.power === 'number' 
                ? html`
                    <power-gauge .watts=${this.power} .ftp=${this.ftp} .pct=${this.scorePct} .avgPower=${this.avgPower}></power-gauge>
                    <speed-o-meter .speed=${this.speed} .avgSpeed=${this.avgSpeed}></speed-o-meter>
                    <show-distance .time=${this.time} .avgSpeed=${this.avgSpeed}></show-distance>

                    `
                : null
        }
        ${
            typeof this.cadence === 'number' 
                ? html`<cadence-meter .rpm=${this.cadence} .avgRpm=${this.avgCadence}></cadence-meter>`
                : null
        }

        ${
            !this.video 
                ? html`<video-selector @videoSelected=${this.selectVideo}></video-selector>`
                : html`
                    <youtube-player .video=${this.video} @stateChanged=${e=>this.videoStateChanged(e.detail)} @sectionChange=${this.sectionChanged}></youtube-player>
                `
        }
        <current-section .section=${this.section}></current-section>
        <calories-burned .seconds=${this.time} .avgPower=${this.avgPower}></calories-burned>
        `;
    }
}