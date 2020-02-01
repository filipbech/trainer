import { LitElement, customElement, property, html, css } from "lit-element";

@customElement('heart-rate')
export class HeartRateElement extends LitElement {

    static styles = [css`
     @keyframes heartbeat {
        0% {
            transform: scale( 1 );
        }
        40% {
            transform: scale( 1.1 );
        }
        60% {
            transform: scale( 1.1 );
        }
        80% {
            transform: scale( 1 );
        }
    }

    :host {
        display:inline-block;
        position:relative;
    }

    svg {
        transform-origin: 50% 50%;
        animation: heartbeat infinite;
        animation-timing-function:linear;
        animation-duration: var(--bpm, 0s);
    }
    path {
        fill: var(--heartColor, #d52d2f);
    }

    #rate {
        position:absolute;
        color:#fff;
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
    _bpm = 0;

    @property()
    avgBpm = 0;
   
    set bpm(value:number) {
        this._bpm = value;
        this.style.setProperty('--bpm', String(60/value)+'s');
    };

    render() {
        return html`
        <svg width="130" height="130">
            <path d="M 65,29 C 59,19 49,12 37,12 20,12 7,25 7,42 7,75 25,80 65,118 105,80 123,75 123,42 123,25 110,12 93,12 81,12 71,19 65,29 z"></path>
        </svg>
        <div id="rate">${this._bpm}<span>${this.avgBpm}</span></div>
          `
    }


}