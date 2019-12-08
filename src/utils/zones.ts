export interface IZone {
    color: string;
    num: number;
    maxFtp: number;
}

export const zones: IZone[] = [{
    color: '#e4fc54',
    num: 1,
    maxFtp: 30
},{
    color: '#e4fc54',
    num: 2,
    maxFtp: 55
},{
    color: '#e4fc54',
    num: 3,
    maxFtp: 60
},{
    color: '#e4fc54',
    num: 4,
    maxFtp: 75
},{
    color: '#eeb540',
    num: 5,
    maxFtp: 82
},{
    color: '#eeb540',
    num: 6,
    maxFtp: 90
},{
    color: '#eeb540',
    num: 7,
    maxFtp: 97
},{
    color: '#d52d2f',
    num: 8,
    maxFtp: 105
},{
    color: '#d52d2f',
    num: 9,
    maxFtp: 115
},{
    color: '#d52d2f',
    num: 10,
    maxFtp: 999
}];

export const zoneFromFtpPercent = (pct:number) => {
    
    for (let zone of zones) {
        if(zone.maxFtp > pct) {
            return zone;
        }
    }
    return zones[0];
}