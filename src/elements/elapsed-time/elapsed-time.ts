import { LitElement, html, property, customElement } from "lit-element";
import { bind, memoize } from "decko";

@customElement('elapsed-time')
export class ElapsedTimeElement extends LitElement {
    @memoize
    static pad2(inp: string|number): string {
        return String(inp).padStart(2, '0');
    }

    @memoize
    static pad3(inp: string|number): string {
        return String(inp).padStart(3, '0');
    }

    @memoize
    static milisecondsToTime(miliseconds:number) {
        const ts = Math.floor((miliseconds % 1000)/100);
        const _sec = Math.floor(miliseconds/1000);
        const sec = ElapsedTimeElement.pad2(_sec % 60);
        const _min = Math.floor(miliseconds/(1000*60));
        const min = ElapsedTimeElement.pad2(_min % 60);
        const _hours = Math.floor(miliseconds/(1000*60*60));
        const hours = ElapsedTimeElement.pad2(_hours % 60);

        return {
            ts, sec, min, hours
        };
    }

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

    @memoize
    renderTime(ms: number) {
        const time = ElapsedTimeElement.milisecondsToTime(ms);
        return html`${time.hours}:${time.min}:${time.sec}:${time.ts}`;
    }


    render() {
        return html`
            ${
                this.status === 'paused'
                    ? html`<button @click=${this.start}>start</button>`
                    : html`<button @click=${this.stop}>stop</button>`
            }<br/>

            <div>${this.renderTime(this.elapsed)}</div>
        `;
    }
}