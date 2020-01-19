// all credits for these files goes to: https://github.com/chadj/gpedal/



let ble_sint16 = ['getInt16', 2, true];
let ble_uint8 = ['getUint8', 1];
let ble_uint16 = ['getUint16', 2, true];
let ble_uint32 = ['getUint32', 4, true];
// TODO: paired 12bit uint handling
let ble_uint24 = ['getUint8', 3];

// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.cycling_power_measurement.xml
let cycling_power_measurement = [
  [0, [ [ble_sint16, 'instantaneous_power'] ]],
  [1, [ [ble_uint8, 'pedal_power_balance'] ]],
  [2, [ /* Pedal Power Balance Reference */]],
  [4, [ [ble_uint16, 'accumulated_torque'] ]],
  [8, [ /* Accumulated Torque Source */]],
  [16, [ [ble_uint32, 'cumulative_wheel_revolutions'], [ble_uint16, 'last_wheel_event_time'] ]],
  [32, [ [ble_uint16, 'cumulative_crank_revolutions'], [ble_uint16, 'last_crank_event_time'] ]],
  [64, [ [ble_sint16, 'maximum_force_magnitude'], [ble_sint16, 'minimum_force_magnitude'] ]],
  [128, [ [ble_sint16, 'maximum_torque_magnitude'], [ble_sint16, 'minimum_torque_magnitude'] ]],
  [256, [ [ble_uint24, 'maximum_minimum_angle'] ]],
  [512, [ [ble_uint16, 'top_dead_spot_angle'] ]],
  [1024, [ [ble_uint16, 'bottom_dead_spot_angle'] ]],
  [2048, [ [ble_uint16, 'accumulated_energy'] ]],
  [4096, [ /* Offset Compensation Indicator */]]
];

// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.csc_measurement.xml
let csc_measurement = [
  [1, [ [ble_uint32, 'cumulative_wheel_revolutions'], [ble_uint16, 'last_wheel_event_time'] ]],
  [2, [ [ble_uint16, 'cumulative_crank_revolutions'], [ble_uint16, 'last_crank_event_time'] ]]
];

class BleCharacteristicParser {
  fields:any;
  mask_size: any;

  getData(dataview:any) {
    let offset = 0;
    let mask;
    if(this.mask_size === 16) {
      mask = dataview.getUint16(0, true);
      offset += 2;
    } else {
      mask = dataview.getUint8(0);
      offset += 1;
    }

    let fieldArrangement = [];

    // Contains required fields
    if(this.fields[0][0] === 0) {
      for(let fdesc of this.fields[0][1]) {
        //@ts-ignore
        fieldArrangement.push(fdesc);
      }
    }

    for(let [flag, fieldDescriptions] of this.fields) {
      if(mask & flag) {
        for(let fdesc of fieldDescriptions) {
          //@ts-ignore
          fieldArrangement.push(fdesc);
        }
      }
    }

    let data:any = {};
    for(let field of fieldArrangement) {
      //@ts-ignore
      var [[accessor, fieldSize, endianness], fieldName] = field;
      let value;
      if(endianness) {
        value = dataview[accessor](offset, endianness);
      } else {
        value = dataview[accessor](offset);
      }

      data[fieldName] = value;
      offset += fieldSize;
    }

    return data;
  }
}

class CyclingSpeedCadenceMeasurementParser extends BleCharacteristicParser {
  constructor () {
    super();
    this.fields = csc_measurement;
    this.mask_size = 8;
  }
}

export class CyclingPowerMeasurementParser extends BleCharacteristicParser {
  constructor () {
    super();
    this.fields = cycling_power_measurement;
    this.mask_size = 16;
  }
}

export class Meter {
  listeners:any;
  timeoutID:number|undefined;
  milliTimeout:number;
  constructor () {
    this.listeners = {};
    this.timeoutID = undefined;
    this.milliTimeout = 8000;
  }

  clearValueOnTimeout(value:any) {
    if(this.timeoutID !== undefined) {
      clearTimeout(this.timeoutID);
    }
    this.timeoutID = setTimeout(() => {
      this.timeoutID = undefined;
      if(value.constructor === Array) {
        for(let v of value) {
          this.dispatch(v, 0);
        }
      } else {
        this.dispatch(value, 0);
      }
    }, this.milliTimeout) as unknown as number;
  }

  addListener(type:string, callback:any) {
    if(!(type in this.listeners)) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);
  }

  dispatch(type:string, value:any) {
    if(!(type in this.listeners)) {
      this.listeners[type] = [];
    }

    for(let l of this.listeners[type]) {
      l(value);
    }
  }
}

export class BleMeter extends Meter {
  device:any;
  server:any;
  service:any;
  characteristic:any;
  name: string;
  id:number;
  listening:boolean;
  serviceId:any;
  characteristicId:number;
  listen() {}
  constructor (device:any, server:any, service:any, characteristic:any) {
    super();

    this.device = device;
    this.server = server;
    this.service = service;
    this.characteristic = characteristic;

    this.name = this.device.name;
    this.id = this.device.id;

    this.listening = false;

    this.device.addEventListener('gattserverdisconnected', (e:any) => {
      this.gattserverdisconnected(e)
        .catch(error => {
          console.log("Error: ", error);
        });
    });
  }

  async gattserverdisconnected(e:any) {
    console.log('Reconnecting');
    this.server = await this.device.gatt.connect();
    this.service = await this.server.getPrimaryService(this.serviceId);
    this.characteristic = await this.service.getCharacteristic(this.characteristicId);
    if(this.listening) {
      this.listening = false;
      this.listen();
    }
  }
}

export class BlePowerCadenceMeter extends BleMeter {
  cadenceHistory:number[] = [];
  powerHistory:number[] = [];
  parser = new CyclingPowerMeasurementParser();
  lastCrankRevolutions = 0;
  lastCrankTime = 0;
  lastWheelRevolutions = 0;
  lastWheelTime = 0;
  constructor (device:any, server:any, service:any, characteristic:any) {
    super(device, server, service, characteristic);
    this.serviceId = 0x1818;
    this.characteristicId = 0x2A63;
  }

  listen() {
    if(!this.listening) {
      this.characteristic.addEventListener('characteristicvaluechanged', (event:any) => {
        let data = this.parser.getData(event.target.value);
        let power = data['instantaneous_power'];
        let crankRevolutions = data['cumulative_crank_revolutions'];
        let crankTime = data['last_crank_event_time'];
        let wheelRevolutions = data['cumulative_wheel_revolutions'];
        let wheelTime = data['last_wheel_event_time'];

        /* Crank Calc */
        if(this.lastCrankTime > crankTime) {
          this.lastCrankTime = this.lastCrankTime - 65536;
        }
        if(this.lastCrankRevolutions > crankRevolutions) {
          this.lastCrankRevolutions = this.lastCrankRevolutions - 65536;
        }

        let revs = crankRevolutions - this.lastCrankRevolutions;
        let duration = (crankTime - this.lastCrankTime) / 1024;

        if(duration > 0) {
          const rpm = Math.round((revs / duration) * 60);
          if(rpm < 300) {
            this.dispatch('cadence', rpm);
            this.cadenceHistory.push(rpm);
            const cadenceHistoryLength = this.cadenceHistory.length;
            if(cadenceHistoryLength % 5 === 0) {
              // only calculate averages every 5 valuechanges
              const aveCadence = this.cadenceHistory.reduce((a,b)=>a+b,0)/cadenceHistoryLength;
              this.dispatch('aveCadence', Math.round(aveCadence));
            }
          }
        }

        this.lastCrankRevolutions = crankRevolutions;
        this.lastCrankTime = crankTime;
        /* End Crank Calc */

        /* Wheel Calc */
        if(wheelRevolutions !== undefined && wheelTime !== undefined) {
            if(this.lastWheelTime > wheelTime) {
                this.lastWheelTime = this.lastWheelTime - 65536;
            }
            if(this.lastWheelRevolutions > wheelRevolutions) {
                this.lastWheelRevolutions = this.lastWheelRevolutions - 65536;
            }

            let wheelRevs = wheelRevolutions - this.lastWheelRevolutions;
            let wheelDuration = (wheelTime - this.lastWheelTime) / 1024;
            let wheelRpm = 0;
            if(wheelDuration > 0) {
                wheelRpm = (wheelRevs / wheelDuration) * 60;
            }

            this.lastWheelRevolutions = wheelRevolutions;
            this.lastWheelTime = wheelTime;

            this.dispatch('wheelrpm', wheelRpm);
        }
        /* End Wheel Calc */


        this.dispatch('power', power);

        this.powerHistory.push(power);
        const powerHistoryLength = this.powerHistory.length;
        if(powerHistoryLength % 5 === 0) {
          // only calculate averages every 5 valuechanges
          const avePower = this.powerHistory.reduce((a,b)=>a+b,0)/powerHistoryLength;
          this.dispatch('avePower', Math.round(avePower));
        }    

        this.clearValueOnTimeout(['power', 'cadence', 'wheelrpm']);
      });
      this.characteristic.startNotifications();
      this.listening = true;
    }
  }

}

export class BlePowerMeter extends BleMeter {
  powerHistory:number[] = [];
  parser = new CyclingPowerMeasurementParser();
  constructor (device:any, server:any, service:any, characteristic:any) {
    super(device, server, service, characteristic);

    this.serviceId = 0x1818;
    this.characteristicId = 0x2A63;
  }

  listen() {
    if(!this.listening) {
      this.characteristic.addEventListener('characteristicvaluechanged', (event:any) => {
        let data = this.parser.getData(event.target.value);
        let power = data['instantaneous_power'];
        this.dispatch('power', power);

        this.powerHistory.push(power);
        const powerHistoryLength = this.powerHistory.length;
        if(powerHistoryLength % 5 === 0) {
          // only calculate averages every 5 valuechanges
          const avePower = this.powerHistory.reduce((a,b)=>a+b,0)/powerHistoryLength;
          this.dispatch('avePower', Math.round(avePower));
        }        

        this.clearValueOnTimeout('power');
      });
      this.characteristic.startNotifications();
      this.listening = true;
    }
  }

}

export class BleCadenceMeter extends BleMeter  {
  cadenceHistory: number[] = [];
  parser = new CyclingSpeedCadenceMeasurementParser();
  lastCrankRevolutions = 0;
  lastCrankTime = 0;
  lastWheelRevolutions = 0;
  lastWheelTime = 0;
  constructor (device:any, server:any, service:any, characteristic:any) {
    super(device, server, service, characteristic);

    this.serviceId = 0x1816;
    this.characteristicId = 0x2A5B;
  }

  listen() {
    if(!this.listening) {
      this.characteristic.addEventListener('characteristicvaluechanged', (event:any) => {
        let data = this.parser.getData(event.target.value);
        let crankRevolutions = data['cumulative_crank_revolutions'];
        let crankTime = data['last_crank_event_time'];
        let wheelRevolutions = data['cumulative_wheel_revolutions'];
        let wheelTime = data['last_wheel_event_time'];

        if(crankRevolutions !== undefined && crankTime !== undefined) {
            if(this.lastCrankTime > crankTime) {
                this.lastCrankTime = this.lastCrankTime - 65536;
            }
            if(this.lastCrankRevolutions > crankRevolutions) {
                this.lastCrankRevolutions = this.lastCrankRevolutions - 65536;
            }

            let revs = crankRevolutions - this.lastCrankRevolutions;
            let duration = (crankTime - this.lastCrankTime) / 1024;
            if(duration > 0) {
              const rpm = Math.round((revs / duration) * 60);
              if(rpm < 300) {
                this.dispatch('cadence', rpm);
                this.cadenceHistory.push(rpm);
                const cadenceHistoryLength = this.cadenceHistory.length;
                if(cadenceHistoryLength % 5 === 0) {
                  // only calculate averages every 5 valuechanges
                  const aveCadence = this.cadenceHistory.reduce((a,b)=>a+b,0)/cadenceHistoryLength;
                  this.dispatch('aveCadence', Math.round(aveCadence));
                }
              }
            }

            this.lastCrankRevolutions = crankRevolutions;
            this.lastCrankTime = crankTime;
        }

        if(wheelRevolutions !== undefined && wheelTime !== undefined) {
            if(this.lastWheelTime > wheelTime) {
                this.lastWheelTime = this.lastWheelTime - 65536;
            }
            if(this.lastWheelRevolutions > wheelRevolutions) {
                this.lastWheelRevolutions = this.lastWheelRevolutions - 65536;
            }
    
            let wheelRevs = wheelRevolutions - this.lastWheelRevolutions;
            let wheelDuration = (wheelTime - this.lastWheelTime) / 1024;
            let wheelRpm = 0;
            if(wheelDuration > 0) {
                wheelRpm = (wheelRevs / wheelDuration) * 60;
            }
    
            this.lastWheelRevolutions = wheelRevolutions;
            this.lastWheelTime = wheelTime;

            this.dispatch('wheelrpm', wheelRpm);
        }

        this.clearValueOnTimeout(['cadence', 'wheelrpm']);
      });
      this.characteristic.startNotifications();
      this.listening = true;
    }
  }

}

export class BleHRMeter extends BleMeter {
  hrHistory: number[] = [];
  constructor (device:any, server:any, service:any, characteristic:any) {
    super(device, server, service, characteristic);

    this.serviceId = 0x180D;
    this.characteristicId = 0x2A37;
  }

  listen() {
    if(!this.listening) {
      this.characteristic.addEventListener('characteristicvaluechanged', (event:any) => {
        let hr = event.target.value.getUint8(1);
        this.dispatch('hr', hr);

        this.hrHistory.push(hr);
        const hrHistoryLength = this.hrHistory.length;
        if(hrHistoryLength % 5 === 0) {
          // only calculate averages every 5 valuechanges
          const aveHr = this.hrHistory.reduce((a,b)=>a+b,0)/hrHistoryLength;
          this.dispatch('aveHr', Math.round(aveHr));
        }  

        this.clearValueOnTimeout('hr');
      });
      this.characteristic.startNotifications();
      this.listening = true;
    }
  }
}