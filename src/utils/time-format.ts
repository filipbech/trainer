import { memoize } from "decko";
import { html } from "lit-element";

export class TimeFormat {
    @memoize
    static pad2(inp: string|number): string {
        return String(inp).padStart(2, '0');
    }

    @memoize
    static milisecondsToTime(miliseconds:number) {
        const ts = Math.floor((miliseconds % 1000)/100);
        const _sec = Math.floor(miliseconds/1000);
        const sec = _sec % 60;
        const _min = Math.floor(miliseconds/(1000*60));
        const min = _min % 60;
        const _hours = Math.floor(miliseconds/(1000*60*60));
        const hours = _hours % 60;

        return {
            ts, sec, min, hours
        };
    }

    @memoize
    static renderTime(ms: number, showDecimals = false) {
        const time = TimeFormat.milisecondsToTime(ms);
        return html`${time.hours ? `${TimeFormat.pad2(time.hours)}:` : null}${TimeFormat.pad2(time.min)}:${TimeFormat.pad2(time.sec)}${showDecimals ? `:${time.ts}` : null}`;
    }

}