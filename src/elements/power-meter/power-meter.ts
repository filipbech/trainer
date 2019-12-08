import { LitElement, customElement, property, html, css } from "lit-element";

import { zoneFromFtpPercent, IZone, zones } from '../../utils/zones';

@customElement('power-meter')
export class PowerMeterElement extends LitElement {

    static styles = [css`
    :host {
        display:inline-block;
        position:relative;
        --zoneColor: green;
        border: 10px solid var(--zoneColor);
        border-radius:5px;
        padding:5px;
        width:100px;
        font-size:30px;
        background:#fff;
    }

    #rate {
        text-align:center;
        font-weight:bold;
    }
    #rate span {
        font-size:11px;
        display:block;
        font-weight:normal;
    }

    `];

    _watts:number;
    _ftp:number;
    zone: IZone;
    ftpPercent: number;

    set watts(value: number) {
        this._watts = value;   
        this.sideEffects();
        this.requestUpdate();
    };
    get watts() {
        return this._watts;
    }

    set ftp(value:number) {
        this._ftp = value;
        this.sideEffects();
        this.requestUpdate();
    }
    get ftp() {
        return this._ftp;
    }

    sideEffects() {
        if (this._watts && this._ftp) {
            this.ftpPercent = (this._watts/this._ftp)*100;
            this.dispatchEvent(new CustomEvent('ftpPercentChanged', { detail: this.ftpPercent }))
            const zone = zoneFromFtpPercent(this.ftpPercent);
            if(this.zone !== zone) {
                this.zone = zone;
                this.dispatchEvent(new CustomEvent('zoneChanged', { detail: { zone, zoneNum: zones.indexOf(zone)} }))
            }
            this.style.setProperty('--zoneColor', this.zone.color);
        }
    }

    render() {
        return html`
            <div id="rate">${this._watts}<span>watt</span></div>
          `
    }


}