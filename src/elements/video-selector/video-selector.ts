import { LitElement, html, customElement } from "lit-element";
import { bind } from "decko";
import { videos } from '../../video';

const STORAGEKEY = "videoSelected";
@customElement('video-selector')
export class VideoSelectorElement extends LitElement {

    _videos;
    set videos(v) {
        this._videos = v.map(video => {
            return {
                ...video,
                duration: video.sections.reduce((acc, cur) => cur ? acc + cur.duration : acc, 0)
            }
        }).sort((a,b)=> a.duration-b.duration);
    };
    get videos() {
        return this._videos;
    }

    connectedCallback() {
        super.connectedCallback();
        const selected = localStorage.getItem(STORAGEKEY);
        this.videos = videos.map(v=> {
            if (v.video === selected) {
                v["selected"] = true;
            }
            return v;
        });
        
    }

    @bind
    onSubmit(e) {
        e.preventDefault();
        const f = new FormData(e.target);
        const index:number = f.get('video') as any;
        const detail = this.videos[index];
        localStorage.setItem(STORAGEKEY, detail.video);
        this.dispatchEvent(new CustomEvent('videoSelected', { detail }))
        return false;
    }

    render() {
        return html`
        <form @submit=${this.onSubmit}>
            <select name="video" id="select">
                ${
                    this.videos.map((video, index) => html`
                        <option value=${index} ?selected=${video.selected}>(${Math.floor((video.duration + 10 /** to make up for videos that start a couple seconds to late */)/60)} min) ${video.title}</option>
                    `)
                }
            </select>
            <button>Go</button>
        </form>
        `;
    }
}