export interface IZone {
    color: string;
    num: number;
    maxFtp: number;
}

export const zones: IZone[] = [{
    color: '#d9e4cd',
    num: 1,
    maxFtp: 30
},{
    color: '#c4e4a5',
    num: 2,
    maxFtp: 55
},{
    color: '#96df73',
    num: 3,
    maxFtp: 60
},{
    color: '#70d551',
    num: 4,
    maxFtp: 75
},{
    color: '#fbde42',
    num: 5,
    maxFtp: 82
},{
    color: '#ffcb00',
    num: 6,
    maxFtp: 90
},{
    color: '#faba43',
    num: 7,
    maxFtp: 97
},{
    color: '#e8503e',
    num: 8,
    maxFtp: 105
},{
    color: '#cb3725',
    num: 9,
    maxFtp: 115
},{
    color: '#aa2d2a',
    num: 10,
    maxFtp: 150
}];

export const zoneFromFtpPercent = (pct:number) => {
    
    for (let zone of zones) {
        if(zone.maxFtp > pct) {
            return zone;
        }
    }
    return zones[0];
}

export const zoneAndScoreFromFtpPercent = (pct:number) => {
    let prevZone:any = {
        maxFtp:0
    }
    for (let zone of zones) {
        if(zone.maxFtp > pct) {
            const zoneSize = zone.maxFtp - prevZone.maxFtp;
            const zonePointScore = zoneSize - (zone.maxFtp - pct)

            const zoneScore = (zonePointScore/zoneSize)*100;
            const scorePct = (zones.indexOf(zone)*10) + Math.floor(zoneScore/10);

            return { zone, scorePct };
        }
        prevZone = zone;
    }

    // you are above the highest
    return { zone: prevZone, scorePct:100 }
}