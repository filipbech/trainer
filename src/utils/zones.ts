export const zones = [{
    color: '#fff',
    num: 1,
    maxFtp: 30
},{
    color: '#fff',
    num: 2,
    maxFtp: 55
},{
    color: 'blue',
    num: 3,
    maxFtp: 60
},{
    color: 'blue',
    num: 4,
    maxFtp: 75
},{
    color: 'green',
    num: 5,
    maxFtp: 82
},{
    color: 'green',
    num: 6,
    maxFtp: 90
},{
    color: 'yellow',
    num: 7,
    maxFtp: 97
},{
    color: 'yellow',
    num: 8,
    maxFtp: 105
},{
    color: 'red',
    num: 9,
    maxFtp: 115
},{
    color: 'red',
    num: 10,
    maxFtp: 999
}];

export const zoneFromWatt = (watt:number, ftp:number) => {
    const pct = watt/ftp;
    for (let zone of zones) {
        if(zone.maxFtp > pct) {
            return zone;
        }
    }
}