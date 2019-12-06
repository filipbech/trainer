import { CyclingPowerMeasurementParser, BlePowerCadenceMeter, BlePowerMeter, BleHRMeter } from './meter';
import { readCharacteristicValue } from './read-characteristic-value';

interface IMeters {
    powerMeter?: BlePowerMeter | BlePowerCadenceMeter;
    cadenceMeter?: BlePowerCadenceMeter;
    hrMeter?: BleHRMeter;
}

export const connect = async () => {
    const device = await navigator.bluetooth.requestDevice({
        filters: [
        // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml
        {services: [0x180D]},
        // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.cycling_power.xml
        {services: [0x1818]},
        // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.cycling_speed_and_cadence.xml
        {services: [0x1816]}]
    });
    const server = await (device as any).gatt.connect();

    const meters: IMeters = {};

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

    return meters;
}