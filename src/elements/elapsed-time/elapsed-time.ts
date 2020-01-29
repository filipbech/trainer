import { LitElement, html, property, customElement } from "lit-element";
import { bind, memoize } from "decko";
import { TimeFormat } from "../../utils/time-format";

@customElement('elapsed-time')
export class ElapsedTimeElement extends LitElement {

    @property()
    elapsed = 0;

    startTime: Date;

    @property()
    status = 'paused';

    @bind
    start() {
        if (this.status === 'running') {
            // if we are already running dont do anything else
            return;
        }
        this.status = 'running';
        this.dispatchEvent(new CustomEvent("playpause", { detail: this.status === 'running' }))
        if(this.elapsed) {
            this.startTime = new Date(new Date().getTime()-this.elapsed);
        } else {
            this.startTime = new Date();
        }
        this.updateTimer();
    }

    @bind
    stop() {
        this.status = 'paused';
        this.dispatchEvent(new CustomEvent("playpause", { detail: this.status === 'running' }))
    }

    @bind
    updateTimer() {
        if(this.status !== 'running') {
            return
        }
        const now = new Date();
        const diff = now.getTime()-this.startTime.getTime();
        this.elapsed = diff;
        this.dispatchEvent(new CustomEvent("time", { detail: Math.floor(this.elapsed/1000) }))
        setTimeout(this.updateTimer, 100);
    }

    reset() {
        this.elapsed = 0;
        this.status = 'paused';
    }

    render() {
        return html`
            ${
                this.status === 'paused'
                    ? html`<button @click=${this.start}>start</button>`
                    : html`<button @click=${this.stop}>stop</button>`
            }<br/>

            <div>${TimeFormat.renderTime(this.elapsed, true)}</div>
        `;
    }
}