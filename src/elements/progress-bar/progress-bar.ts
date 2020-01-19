import { LitElement, customElement, css, html, property } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';
import { zones } from '../../utils/zones';

@customElement('progress-bar')
export class ProgressBarElement extends LitElement {
    static styles = [css`
        :host {
            display:block;
            padding-bottom:5px;
            overflow:hidden;
        }
        #all {
            display:flex;
            position:relative;
        }
        #all:after {
            content:'';
            position:absolute;
            left:0;
            bottom:0px;
            height:5px;
            width:100%;
            transform-origin:0 0;
            transform: scaleX(var(--share,0));
            background:black;
        }
        .section {
            height:10px;
            position:relative;
        }
        .section:after {
            content:'';
            position:absolute;
            right:0;
            top:0;
            bottom:0;
            width:1px;
            background:black;
            display:block;
        }
        .section:last-child:after {
            display:none;
        }

    `];

    totalSectionTime = 0;

    set seconds(value: number) {
        this.style.setProperty('--share', String(value / this.length));
        this.requestUpdate();
    }

    @property() length: number;

    @property() startTime: number = 0;
    

    _sections:any[];
    set sections(sections:any[]) {
        this._sections = sections;
        this.totalSectionTime = this.sections.reduce((acc, section) => acc+section.duration, 0);
        this.requestUpdate();
    }
    get sections() {
        return this._sections;
    }
    

    render() {
        return html`
            <div id="all">
                <div class="section" style=${styleMap({
                    backgroundColor: '#fff',
                    flex: `1 1 ${this.startTime}%` 
                })}></div>
                ${
                    this.sections.map(section => html`
                        <div class="section" style=${styleMap({
                            backgroundColor: zones.find(zone=>zone.num == section.effort)!.color,
                            flex: `1 1 ${section.duration}%` 
                        })}></div>
                    `)
                }
                <div class="section" style=${styleMap({
                    backgroundColor: '#fff',
                    flex: `1 1 ${this.length-this.startTime-this.totalSectionTime}%` 
                })}></div>
            </div>
        `;
    }
}  