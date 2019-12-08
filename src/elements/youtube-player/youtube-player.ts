import { LitElement, html, customElement, css, property } from "lit-element";

import { ensureApi } from './api';
import { bind } from "decko";


const STATES: any[] = ['unstarted','ended','playing','paused','buffering','video cued'];

@customElement("youtube-player")
export class YoutubePlayerElement extends LitElement {

    static styles = [css`
        :host {
            display:inline-block;
        }
        #container {
            display:block;
            width:100%;
            padding-top:56.25%;
            position:relative;
        }
        iframe#player {
            position:absolute;
            top:0;
            bottom:0;
            left:0;
            right:0;
        }
    `]

    state: 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'video cued';
    youtubeplayer:any;
    time:number;

    @property()
    set videoId(videoId:string) {
        ensureApi().then(_=> {
            this.youtubeplayer = new window['YT']!.Player(this.shadowRoot!.getElementById('player'), {
                height: '100%',
                width: '100%',
                videoId: videoId,
                events: {
                    'onReady': () => {
                        this.youtubeplayer.seekTo(60,true)
                        this.youtubeplayer.playVideo();
                    },
                    'onStateChange': (state) => {
                        this.state = STATES[state.data+1];
                        this.dispatchEvent(new CustomEvent('stateChanged', { detail: this.state } ));
                        if(this.state === STATES[2]) {
                            this.updateTime();
                        }
                    }
                }
            });
        }).catch(e => {
            console.log('youtube api error', e)
        });
    }

    @bind
    updateTime() {
        this.time = Math.round(this.youtubeplayer.getCurrentTime());
        this.dispatchEvent(new CustomEvent('timeChanged', { detail: this.time } ));
        if(this.state === 'playing') {
            // update time again in 1s
            setTimeout(this.updateTime, 1000);
        }
    }

    render() {
        return html`<div id="container"><div id="player"></div></div>`
    }
}