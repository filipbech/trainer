import { CyclingPowerMeasurementParser, BlePowerCadenceMeter, BlePowerMeter, BleHRMeter } from './meter.js';

const speedFromPower = (power, grade, elevation) => {
    let temp = 23.8889;
    let pressure = Math.exp(-elevation / 7000) * 1000;
    let dew = 7.5;

    let options = {
      units: 'metric',
      // Rider Weight
      rp_wr: this.riderWeight * (this.unit === 'imperial' ? 0.453592 : 1),
      // Bike Weight
      rp_wb: 8,
      //  Frontal area A(m2)
      rp_a: 0.65,
      // Drag coefficient Cd
      rp_cd: 0.63,
      // Drivetrain loss Lossdt (%)
      rp_dtl: 4,
      // Coefficient of rolling resistance Crr
      ep_crr: 0.005,
      // Grade %
      ep_g: grade,
      ep_rho: CalculateRho(temp, pressure, dew)
    }

    let velocity = CalculateVelocity(power, options);
    // convert to m/s
    velocity = velocity * 0.277778;

    return velocity;
  }


const caloriesFromWattSeconds = (avgWatt, seconds) => {
    return 4 * ((avgWatt*seconds)/4186);
}

const zoneFromWatt = (watt, ftp) => {
    const pct = watt/ftp;
    for (let zone of zones) {
        if(zone.maxFtp > pct) {
            return zone;
        }
    }
}

const zones = [{
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

document.getElementById('connect').addEventListener('click', async e => {
    const device = await navigator.bluetooth.requestDevice({
        filters: [
        // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml
        {services: [0x180D]},
        // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.cycling_power.xml
        {services: [0x1818]},
        // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.cycling_speed_and_cadence.xml
        {services: [0x1816]}]
    });
    const server = await device.gatt.connect();

    const meters = {};

    (async function() {
        /**
         *  POWERMETER 
         */

        try {    
            const service = await server.getPrimaryService(0x1818);

            let characteristic = await service.getCharacteristic(0x2A63);
            let parser = new CyclingPowerMeasurementParser();
            let value = await readCharacteristicValue(characteristic);
            let data = parser.getData(value);

            if('cumulative_crank_revolutions' in data) {
                let meter = new BlePowerCadenceMeter(device, server, service, characteristic);
                meters.powerMeter = meter;
                meters.cadenceMeter = meter;
            } else {
                meters.powerMeter = new BlePowerMeter(device, server, service, characteristic);
            }
        } catch(e) {
            console.log('powermeter error',e)
        }

        /**
         *  heart rate monitor
         */

        try {
            const service = await server.getPrimaryService(0x180D);
            let characteristic = await service.getCharacteristic(0x2A37);

            meters.hrMeter = new BleHRMeter(device, server, service, characteristic);

        } catch(e) {
            console.log('hr error',e);
        }

        if(meters.powerMeter) {
            meters.powerMeter.listen();
            meters.powerMeter.addListener('power', power => {
                console.log('power', power);
                console.log('speed', speedFromPower(power));
                console.log('kcal på time hvis dette var gnmsnit', caloriesFromWattSeconds(power, 3600));
                console.log('zone', zoneFromWatt(power, 250))
            });
        }

        if(meters.cadenceMeter) {
            meters.cadenceMeter.listen();
            meters.cadenceMeter.addListener('cadence', cadence => {
                console.log('cadence RPM', cadence)
            });
        }
        if(meters.hrMeter) {
            meters.hrMeter.listen();
            meters.hrMeter.addListener('hr', hr => {
                console.log('heartRate BPM', hr);
            });
        }
    })();  

})


/**
 * ideas
 * - show next to video (youtube)
 *      - show what you are supposed to do
 *      - show "graph" over session and how far along you are
 * - show effort (based on your ftp)
 * - show RPM
 * - show heartrate
 * - show speed (or what?)
 * - show kalories
 * - draw graph over effort 
 * - show averages (watt, cadence, speed, hr)
 * - track peaks 
 * 
 * 
 * - litElement
 * - pwa/offline
 * 
 * - list of sessions
 * - personal bests
 * 
 * - upload to strava (can we do that?)
 * 
 */