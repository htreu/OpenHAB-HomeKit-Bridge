'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class Thermostat extends OhItem {
  constructor(name, url, state, ohVersion, fahrenheit=false) {
    super(name, url, state, ohVersion);
    this.accessory = this.buildAccessory(state);
    this.fahrenheit = fahrenheit;
  };

  buildAccessory(state) {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let thermostatService = accessory.addService(Service.thermostat, this.name);

    //required characteristics
    let characteristicCurrentHeatingCoolingState = thermostatService.getCharacteristic(Characteristic.CurrentHeatingCoolingState);
    let characteristicTargetHeatingCoolingState = thermostatService.getCharacteristic(Characteristic.TargetHeatingCoolingState);
    let characteristicTargetHeatingCoolingState = thermostatService.getCharacteristic(Characteristic.TargetHeatingCoolingState);
    let characteristicCurrentTemperature = thermostatService.getCharacteristic(Characteristic.CurrentTemperature);
    let characteristicTargetTemperature = thermostatService.getCharacteristic(Characteristic.TargetTemperature);
    let characteristicTemperatureDisplayUnits = thermostatService.getCharacteristic(Characteristic.TemperatureDisplayUnits);

    // Optional Characteristics
    let characteristicCurrentRelativeHumidity = thermostatService.getCharacteristic(Characteristic.CurrentRelativeHumidity);
    let characteristicTargetRelativeHumidity = thermostatService.getCharacteristic(Characteristic.TargetRelativeHumidity);
    let characteristicCoolingThresholdTemperature = thermostatService.getCharacteristic(Characteristic.CoolingThresholdTemperature);
    let characteristicHeatingThresholdTemperature = thermostatService.getCharacteristic(Characteristic.HeatingThresholdTemperature);

    let charactersiticCurrentTemp = accessory
      .addService(Service.TemperatureSensor, this.name)
      .getCharacteristic(Characteristic.CurrentTemperature);

    //charactersiticCurrentTemp.setValue(this.convertState(state));
    //charactersiticCurrentTemp.on('get', this.readOpenHabTemperature.bind(this));

    return accessory;
  };

  updateCharacteristics(message) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV != 'test') {
      console.log('temperature received message: ' + message);
    }
    this.accessory.getService(Service.TemperatureSensor)
      .getCharacteristic(Characteristic.CurrentTemperature)
        .setValue(this.convertState(message));
  };

  readOpenHabTemperature(callback) {
    request(this.url + '/state?type=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(+body);
      }
    })
  };

  convertState(state) {
    if ('Uninitialized' === state) {
      return 0.0;
    }

    if (this.fahrenheit) {
      state = (state - 32) * (5/9);
    }

    return +state;
  };
}

export { Thermostat };
