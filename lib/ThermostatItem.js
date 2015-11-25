'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';
import { ItemType } from './ItemType';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class ThermostatItem extends OhItem {
  constructor(name, url, state, ohVersion, children) {
    super(name, url, state, ohVersion);
    if (ohVersion != 2) {
      throw "ThermostatItem does not currently work with OpenHab 1";
    }
    if (!children) {
      throw "ThermostatItem needs children items";
    }
    this.accessory = this.buildAccessory();
    this.assignChildren(children);
    this.currentStateItem;
    this.targetStateItem;
    this.currentTemperatureItem;
    this.targetTemperatureItem;
    this.currentHumidityItem;
    this.targetHumidityItem;
    this.coolingThresholdTemperatureItem;
    this.heatingThresholdTemperatureItem;
    this.temperatureUnit;
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
          UpdateListener.addSseSubscriber(item.name, this.updateTargetTemperature.bind(this));
          if (this.isCelsius(item)) {
            this.temperatureUnit = 0;
          } else {
            this.temperatureUnit = 1;
          }
        } else {
          console.info(this.name + ": CurrentTemperatureItem => " + item.name);
          this.currentTemperatureItem = item;
          UpdateListener.addSseSubscriber(item.name, this.updateCurrentTemperature.bind(this));
        }
      } else if (this.isItemHumidity(item)) {
        if (this.isItemSetting(item)) {
          console.info(this.name + ": TargetHumidityItem => " + item.name);
          this.targetHumidityItem = item;
          UpdateListener.addSseSubscriber(item.name, this.updateTargetRelativeHumidity.bind(this));
        } else {
          console.info(this.name + ": CurrentHumidityItem => " + item.name);
          this.currentHumidityItem = item;
          UpdateListener.addSseSubscriber(item.name, this.updateCurrentRelativeHumidity.bind(this));
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

    //charactersiticCurrentTemp.setValue(this.convertState(state));
    //charactersiticCurrentTemp.on('get', this.readOpenHabTemperature.bind(this));
    return accessory;
  };

  registerCharacteristicGetter(characteristic, getter) {
    this.accessory.getService(Service.Thermostat)
        .getCharacteristic(characteristic).on('get', getter.bind(this));
  }

  registerCharacteristicSetter(characteristic, setter) {
    this.accessory.getService(Service.Thermostat)
        .getCharacteristic(characteristic).on('set', setter.bind(this));
  }

  registerCharacteristics() {
    if (this.currentStateItem) {
      this.registerCharacteristicGetter(Characteristic.CurrentHeatingCoolingState, this.getCurrentHeatingCoolingState)
    }

    if (this.targetStateItem) {
      this.registerCharacteristicGetter(Characteristic.TargetHeatingCoolingState, this.getTargetHeatingCoolingState);
      this.registerCharacteristicSetter(Characteristic.TargetHeatingCoolingState, this.setTargetHeatingCoolingState)
    }

    if (this.currentTemperatureItem) {
      this.registerCharacteristicGetter(Characteristic.CurrentTemperature, this.getCurrentTemperature)
    }

    if (this.targetTemperatureItem) {
      this.registerCharacteristicGetter(Characteristic.TargetTemperature, this.getTargetTemperature);
      this.registerCharacteristicSetter(Characteristic.TargetTemperature, this.setTargetTemperature)
    }

    if (this.currentHumidityItem) {

    }

    if (this.targetHumidityItem) {

    }

    if (this.coolingThresholdTemperatureItem) {

    }

    if (this.heatingThresholdTemperatureItem) {

    }
  }

  updateCharacteristicValue(item, characteristic, message) {
    console.info(this.name + ": updating value for " + item.name + " to " + message);
    item.updatingFromOpenHAB = true;
    this.accessory.getService(Service.Thermostat)
        .getCharacteristic(characteristic)
        .setValue(this.convertState(message));
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

  updateCurrentHeatingCoolingState(message) {
    this.updateCharacteristicValue(this.currentStateItem, Characteristic.CurrentHeatingCoolingState, message)
  };

  getCurrentHeatingCoolingState(message, callback) {
    this.getCharacteristicValue(this.currentStateItem, callback);
  };

  updateTargetHeatingCoolingState(message) {
    this.updateCharacteristicValue(this.targetStateItem, Characteristic.TargetHeatingCoolingState, message)
  };

  getTargetHeatingCoolingState(message, callback) {
    this.getCharacteristicValue(this.targetStateItem, callback);
  };

  setTargetHeatingCoolingState(value, callback) {
    this.setCharacteristicValue(this.targetStateItem, value, callback);
  };

  updateCurrentTemperature(message) {
    this.updateCharacteristicValue(this.currentTemperatureItem, Characteristic.CurrentTemperature, message)
  };

  getCurrentTemperature(message, callback) {
    this.getCharacteristicValue(this.currentTemperatureItem, callback);
  };

  updateTargetTemperature(message) {
    this.updateCharacteristicValue(this.targetTemperatureItem, Characteristic.TargetTemperature, message)
  };

  getTargetTemperature(message, callback) {
    this.getCharacteristicValue(this.targetTemperatureItem, callback);
  };

  setTargetTemperature(value, callback) {
    this.setCharacteristicValue(this.targetTemperatureItem, value, callback);
  };

  updateCurrentRelativeHumidity(message) {
    this.updateCharacteristicValue(this.currentHumidityItem, Characteristic.CurrentRelativeHumidity, message)
  };

  getCurrentRelativeHumidity(message, callback) {
    this.getCharacteristicValue(this.currentHumidityItem, callback);
  };

  updateTargetRelativeHumidity(message) {
    this.updateCharacteristicValue(this.targetHumidityItem, Characteristic.TargetRelativeHumidity, message)
  };

  getTargetRelativeHumidity(message, callback) {
    this.getCharacteristicValue(this.targetHumidityItem, callback);
  };

  setTargetRelativeHumidity(value, callback) {
    this.setCharacteristicValue(this.targetHumidityItem, value, callback);
  };

  updateCoolingThresholdTemperature(message) {
    this.updateCharacteristicValue(this.coolingThresholdTemperatureItem, Characteristic.CoolingThresholdTemperature, message)
  };

  getCoolingThresholdTemperature(message, callback) {
    this.getCharacteristicValue(this.coolingThresholdTemperatureItem, callback);
  };

  setCoolingThresholdTemperature(value, callback) {
    this.setCharacteristicValue(this.coolingThresholdTemperatureItem, value, callback);
  };

  updateHeatingThresholdTemperature(message) {
    this.updateCharacteristicValue(this.heatingThresholdTemperatureItem, Characteristic.HeatingThresholdTemperature, message)
  };

  getHeatingThresholdTemperature(message, callback) {
    this.getCharacteristicValue(this.heatingThresholdTemperatureItem, callback);
  };

  setHeatingThresholdTemperature(value, callback) {
    this.setCharacteristicValue(this.heatingThresholdTemperatureItem, value, callback);
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

export { ThermostatItem };
