import { LitElement, customElement, property, html, css } from "lit-element";

@customElement('cadence-meter')
export class CadenceMeterElement extends LitElement {

    static styles = [css`
    @keyframes circle {
        from { transform: rotateZ(0deg) }
        to { transform: rotateZ(360deg) }
    }

    :host {
        display:inline-block;
        position:relative;
    }

    #circle {
        position:relative;
        height:130px;
        width:130px;
        transform-origin: 50% 50%;
        animation: circle infinite;
        animation-timing-function:linear;
        animation-duration: var(--rpm, 0s);
    }

    #circle:before, #circle:after {
        content:'';
        display:block;
        width:5px;
        height:5px;
        position:absolute;
        left:50%;
        transform:translateX(-50%);
        background:currentColor;
    }
    #circle:after {
        bottom:0;
    }


    #rate {
        position:absolute;
        font-size:32px;
        left:50%;
        top:50%;
        text-align:center;
        transform: translate(-50%, -60%);
    }
    #rate span {
        display:block;
        font-size:15px;
    }

    `];

    @property()
    _rpm = 0;
    
    @property() 
    avgRpm = 0;


    set rpm(value:number) {
        this._rpm = value;
        this.style.setProperty('--rpm', String(60/value)+'s');
    };

    render() {
        return html`
        <div id="circle"></div>
        <div id="rate">${this._rpm}<span>${this.avgRpm}</span></div>
          `
    }


}