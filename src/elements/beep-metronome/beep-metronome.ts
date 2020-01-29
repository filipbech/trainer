import { LitElement, html, customElement } from "lit-element";
import { bind } from "decko";

@customElement('beep-metronome')
export class BeepMetronomeElement extends LitElement {
    _bpm: number;
    set bpm(newVal) {
        this._bpm = newVal;
        if(newVal && this.running) {
            clearTimeout(this.lastTimeout);
            this.tick();
        }
        this.requestUpdate();
    }
    get bpm() {
        return this._bpm;
    }

    ctx: AudioContext;

    gainNode: GainNode;

    running = true;

    lastTimeout;

    tick() {
        if (this.bpm > 0 && this.running) {
            this.beep();
            this.lastTimeout = setTimeout(_=> {   
                this.tick();
            }, 1000 / (this.bpm/60));
        }
    }

    @bind
    onChange(e) {
        if(e.target.checked) {
            this.running = true;
            this.tick();
        } else {
            this.running = false;
        }
    }

    beep() {
        const osc = this.ctx.createOscillator();
        osc.connect(this.gainNode);
        osc.frequency.value = 880.0;
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    connectedCallback() {
        this.tick();
        super.connectedCallback();
    }

    constructor() {
        super();
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        this.gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
    }

    render() {
        return html`
            <input type="checkbox" id="on" checked @change=${this.onChange} />
        `;
    }
}