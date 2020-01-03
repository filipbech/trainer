import { LitElement, svg, html, customElement, css } from "lit-element";
import { zoneFromFtpPercent, IZone, zones } from '../../utils/zones';

@customElement('power-gauge')
export class PowerGaugeElement extends LitElement {

    static styles = [css`
    .wheel {
      overflow: hidden;
      width: 260px;
      height: 130px;
      position: relative;
    }
    
    .number {
      position:absolute;
      background:#fff;
      color:#000;
      left:50%;
      bottom:0;
      z-index:9;
      transform: translate(-50%, 50%);
      border-radius:50%;
      font-size:36px;
      width:200px;
      height:200px;
      line-height:140px;
      text-align:center;
    }

    .needle {
      width: 50px;
      height: 7px;
      background: #000;
      border-bottom-left-radius: 100%;
      border-bottom-right-radius: 5px;
      border-top-left-radius: 100%;
      border-top-right-radius: 5px;
      position: absolute;
      bottom: 4px;
      left: 20px;
      transform-origin: 220% 4px;
      box-shadow: 0 2px 2px 1px rgba(0, 0, 0, .38);
      transition: transform 0.5s;
      z-index:11;
    }

    .umbrella {
      position: relative;
      transform:rotate(-90deg);
      height: 260px;
      margin:0;
    }
    
    .color, .color:nth-child(n+11):after {
      clip: rect(0, 260px, 260px, 130px);
    }
    
    .color:after, .color:nth-child(n+11) {
      content: "";
      position: absolute;
      border-radius: 50%;
      left: calc(50% - 130px);
      top: calc(50% - 130px);
      width: 260px;
      height: 260px;
      clip: rect(0, 130px, 260px, 0);
    }
    
    .color:nth-child(1):after {
      background-color: #9ED110;
      transform: rotate(18deg);
      z-index: 10;
    }
    
    .color:nth-child(2):after {
      background-color: #50B517;
      transform: rotate(36deg);
      z-index: 9;
    }
    
    .color:nth-child(3):after {
      background-color: #179067;
      transform: rotate(54deg);
      z-index: 8;
    }
    
    .color:nth-child(4):after {
      background-color: #476EAF;
      transform: rotate(72deg);
      z-index: 7;
    }
    
    .color:nth-child(5):after {
      background-color: #9f49ac;
      transform: rotate(90deg);
      z-index: 6;
    }
    
    .color:nth-child(6):after {
      background-color: #CC42A2;
      transform: rotate(108deg);
      z-index: 5;
    }
    
    .color:nth-child(7):after {
      background-color: #FF3BA7;
      transform: rotate(126deg);
      z-index: 4;
    }
    
    .color:nth-child(8):after {
      background-color: #FF5800;
      transform: rotate(144deg);
      z-index: 3;
    }
    
    .color:nth-child(9):after {
      background-color: #FF8100;
      transform: rotate(162deg);
      z-index: 2;
    }
    
    .color:nth-child(10):after {
      background-color: #FEAC00;
      transform: rotate(180deg);
      z-index: 1;
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
      return 250;
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
            <div class="wheel">
                <div class="number">${this.watts}</div>
                <ul class="umbrella">
                    <li class="color"></li>
                    <li class="color"></li>
                    <li class="color"></li>
                    <li class="color"></li>
                    <li class="color"></li>
                    <li class="color"></li>
                    <li class="color"></li>
                    <li class="color"></li>
                    <li class="color"></li>
                    <li class="color"></li>
                </ul>
                <div class="needle"></div>
            </div>

        `;
    }
}