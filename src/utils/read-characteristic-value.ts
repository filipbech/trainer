export function readCharacteristicValue(characteristic:any) {
    return new Promise(function(resolve,reject) {
      let executed = false;
      let listener = (event:any) => {
        characteristic.removeEventListener('characteristicvaluechanged', listener);
        characteristic.stopNotifications();
        if(!executed) {
          executed = true;
          resolve(event.target.value);
        }
      }
  
      characteristic.addEventListener('characteristicvaluechanged', listener);
      characteristic.startNotifications();
    });
  }