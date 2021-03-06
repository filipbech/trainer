import { LitElement, html, customElement, css, property } from "lit-element";

import { ensureApi } from './api';
import { bind } from "decko";
import { ISection, IVideo } from "../../video";


const STATES: any[] = ['unstarted','ended','playing','paused','buffering','video cued'];

@customElement("youtube-player")
export class YoutubePlayerElement extends LitElement {

    static styles = [css`
        :host {
            display:block;
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
        progress-bar {
            position:absolute;
            bottom:30px;
            left:11px;
            right:11px;
            pointer-events:none;
        }
    `]

    state: 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'video cued';

    _player;
    set youtubeplayer(newVal) {
        this._player = newVal;
    }
    get youtubeplayer() {
        return this._player;
    }

    @property()
    time:number;

    _video;
    @property()
    set video(video: IVideo) {
        if (this._video === video) {
            return;
        }
        this._video = video;
        ensureApi().then(_=> {
            this.youtubeplayer = new window['YT']!.Player(this.shadowRoot!.getElementById('player'), {
                height: '100%',
                width: '100%',
                videoId: video.video,
                events: {
                    'onReady': () => {
                        this.youtubeplayer.seekTo(0,true)
                        this.youtubeplayer.playVideo();
                        this.video.length = this.youtubeplayer.getDuration();
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
    get video() {
        return this._video;
    }

    @bind
    updateTime() {
        if(this.state === 'playing') {
            // update time again in 1s
            setTimeout(this.updateTime, 1000);
        }
        this.time = Math.round(this.youtubeplayer.getCurrentTime());
        this.dispatchEvent(new CustomEvent('timeChanged', { detail: this.time } ));
        this.updateSection();
    }

    section: ISection;
    updateSection() {
        let currentSection;
        let timeleft = this.time - this.video.startTime;

        if(timeleft > 0) {
            for(let section of this.video.sections) {
                if(timeleft > section.duration) {
                    timeleft = timeleft-section.duration;
                } else {
                    currentSection = section;
                    break;
                }
            }
        } else {
            currentSection = null;
        }

        if (currentSection !== this.section) {
            this.dispatchEvent(new CustomEvent('sectionChange', { detail: currentSection }))
            this.section = currentSection;
        }
    }

    render() {
        return html`<div id="container">
            <div id="player"></div>
            <progress-bar .sections=${this.video.sections} .seconds=${this.time} .startTime=${this.video.startTime} .length=${this.video.length}></progress-bar>
        </div>`
    }
}