'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';
import { ItemType } from './ItemType';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class ThermostatItem extends OhItem {
  constructor(name, url, state, ohVersion, children) {
    super(name, url, state, ohVersion);
    this.currentStateItem;
    this.targetStateItem;
    this.currentTemperatureItem;
    this.targetTemperatureItem;
    this.currentHumidityItem;
    this.targetHumidityItem;
    this.coolingThresholdTemperatureItem;
    this.heatingThresholdTemperatureItem;
    this.temperatureUnit;
    if (ohVersion != 2) {
      throw "ThermostatItem does not currently work with OpenHab 1";
    }
    if (!children) {
      throw "ThermostatItem needs children items";
    }
    this.accessory = this.buildAccessory();
    this.assignChildren(children);
    this.registerCharacteristics();
  };

  assignChildren(children) {
    //finds which of the children could be used for each of the characteristics the thermostat
    //supports. This may not always be correct...

    for (var i = 0; i < children.length; i++) {
      var item = children[i];
      if (this.isItemTemperature(item)) {
        if (this.isItemSetting(item)) {
          console.info(this.name + ": TargetTemperatureItem => " + item.name);
          this.targetTemperatureItem = item;
          if (this.isCelsius(item)) {
            this.temperatureUnit = 0;
          } else {
            this.temperatureUnit = 1;
          }
        } else {
          console.info(this.name + ": CurrentTemperatureItem => " + item.name);
          this.currentTemperatureItem = item;
        }
      } else if (this.isItemHumidity(item)) {
        if (this.isItemSetting(item)) {
          console.info(this.name + ": TargetHumidityItem => " + item.name);
          this.targetHumidityItem = item;
        } else {
          console.info(this.name + ": CurrentHumidityItem => " + item.name);
          this.currentHumidityItem = item;
        }
      }
    }
  }

  isCelsius(item) {
    if (!this.isItemTemperature(item)) {
      throw "Not a temperature item";
    }
    let unitOfMeasurement = item.displayPattern.slice(-1).toUpperCase();
    if (unitOfMeasurement == "C") {
      return true;
    } else {
      return false;
    }
  }

  isItemTemperature(item) {
    if (item.displayPattern) {
      let unitOfMeasurement = item.displayPattern.slice(-1).toUpperCase();
      if (unitOfMeasurement == "F" || unitOfMeasurement == "C") {
        return true;
      } else {
        return false;
      }
    }
  }

  isItemHumidity(item) {
    if (item.displayPattern) {
      let unitOfMeasurement = item.displayPattern.slice(-1).toUpperCase();
      if (unitOfMeasurement == "%") {
        return true;
      } else {
        return false;
      }
    }
  }

  isItemSetting(item) {
    var itemName = item.name.toLowerCase();
    if (itemName.indexOf("set") > -1) {
      return true;
    } else {
      return false;
    }
  }

  buildAccessory() {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let thermostatService = accessory.addService(Service.Thermostat, this.name);

    //required characteristics
    let characteristicCurrentHeatingCoolingState = thermostatService.getCharacteristic(Characteristic.CurrentHeatingCoolingState);
    characteristicCurrentHeatingCoolingState.setValue(0);

    let characteristicTargetHeatingCoolingState = thermostatService.getCharacteristic(Characteristic.TargetHeatingCoolingState);
    characteristicTargetHeatingCoolingState.setValue(0);

    let characteristicCurrentTemperature = thermostatService.getCharacteristic(Characteristic.CurrentTemperature);
    characteristicCurrentTemperature.setValue(24);

    let characteristicTargetTemperature = thermostatService.getCharacteristic(Characteristic.TargetTemperature);
    characteristicTargetTemperature.setValue(25);

    let characteristicTemperatureDisplayUnits = thermostatService.getCharacteristic(Characteristic.TemperatureDisplayUnits);
    characteristicTemperatureDisplayUnits.setValue(1);//Fahrenheit

    // Optional Characteristics
    let characteristicCurrentRelativeHumidity = thermostatService.getCharacteristic(Characteristic.CurrentRelativeHumidity);
    let characteristicTargetRelativeHumidity = thermostatService.getCharacteristic(Characteristic.TargetRelativeHumidity);
    let characteristicCoolingThresholdTemperature = thermostatService.getCharacteristic(Characteristic.CoolingThresholdTemperature);
    let characteristicHeatingThresholdTemperature = thermostatService.getCharacteristic(Characteristic.HeatingThresholdTemperature);

    return accessory;
  };

  updateCharacteristicValue(item, service, message) {
    console.info(this.name + ": updating value for " + item.name + " to " + message);
    item.updatingFromOpenHAB = true;
    service.setValue(this.convertState(message));
    item.updatingFromOpenHAB = false;
  }

  getCharacteristicValue(item, callback) {
    var url = item.url + '/state?type=json';
    console.info(this.name + ": Getting value for " + item.name + " from " + url);
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(+body);
      }
    })
  };

  setCharacteristicValue(item, value, callback) {
    if (item.updatingFromOpenHAB) {
      callback();
      return;
    }
    console.log("received value from iOS: " + value + " for " + item.name);
    var command = 0;

    request.post(
        this.url,
        {
          body: value,
          headers: {'Content-Type': 'text/plain'}
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body)
          }
          callback();
        }
    );
  }

  registerCharacteristicGetter(item, characteristic) {
    this.accessory.getService(Service.Thermostat)
        .getCharacteristic(characteristic).on('get', (callback) => this.getCharacteristicValue(item, callback));
  }

  registerCharacteristicSetter(item, characteristic) {
    this.accessory.getService(Service.Thermostat)
        .getCharacteristic(characteristic).on('set', (value, callback) => this.setCharacteristicValue(item, value, callback));
  }

  registerCharacteristicUpdater(item, characteristic) {
    let service = this.accessory.getService(Service.Thermostat).getCharacteristic(characteristic);
    UpdateListener.addSseSubscriber(item.name, (message) => this.updateCharacteristicValue(item, service, message));
  }

  registerCharacteristics() {
    if (this.currentStateItem) {
      this.registerCharacteristicUpdater(this.currentStateItem, Characteristic.CurrentHeatingCoolingState);
      this.registerCharacteristicGetter(this.currentStateItem, Characteristic.CurrentHeatingCoolingState);
    }

    if (this.targetStateItem) {
      this.registerCharacteristicUpdater(this.targetStateItem, Characteristic.TargetHeatingCoolingState);
      this.registerCharacteristicGetter(this.targetStateItem, Characteristic.TargetHeatingCoolingState);
      this.registerCharacteristicSetter(this.targetStateItem, Characteristic.TargetHeatingCoolingState);
    }

    if (this.currentTemperatureItem) {
      this.registerCharacteristicUpdater(this.currentTemperatureItem, Characteristic.CurrentTemperature);
      this.registerCharacteristicGetter(this.currentTemperatureItem, Characteristic.CurrentTemperature);
    }

    if (this.targetTemperatureItem) {
      this.registerCharacteristicUpdater(this.targetTemperatureItem, Characteristic.TargetTemperature);
      this.registerCharacteristicGetter(this.targetTemperatureItem, Characteristic.TargetTemperature);
      this.registerCharacteristicSetter(this.targetTemperatureItem, Characteristic.TargetTemperature);
    }

    if (this.currentHumidityItem) {
      this.registerCharacteristicUpdater(this.currentHumidityItem, Characteristic.CurrentRelativeHumidity);
      this.registerCharacteristicGetter(this.currentHumidityItem, Characteristic.CurrentRelativeHumidity);
    }

    if (this.targetHumidityItem) {
      this.registerCharacteristicUpdater(this.targetTemperatureItem, Characteristic.TargetRelativeHumidity);
      this.registerCharacteristicGetter(this.targetTemperatureItem, Characteristic.TargetRelativeHumidity);
      this.registerCharacteristicSetter(this.targetTemperatureItem, Characteristic.TargetRelativeHumidity);
    }

    if (this.coolingThresholdTemperatureItem) {
      console.info("coolingThresholdTemperatureItem not implemented");
    }

    if (this.heatingThresholdTemperatureItem) {
      console.info("heatingThresholdTemperatureItem not implemented");
    }
  }

  convertState(state) {
    if ('Uninitialized' === state) {
      return 0.0;
    }
    //
    //if (this.fahrenheit) {
    //  state = (state - 32) * (5/9);
    //}

    return +state;
  };
}

export { ThermostatItem };
