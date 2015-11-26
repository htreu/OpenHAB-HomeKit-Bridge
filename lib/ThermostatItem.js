'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';
import { ItemType } from './ItemType';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class ThermostatItem extends OhItem {
  constructor(name, url, state, ohVersion, children) {
    super(name, url, state, ohVersion);
    this.currentHeatingCoolingStateItem;
    this.currentHeatingCoolingStateCharacteristic;
    this.targetHeatingCoolingStateItem;
    this.targetHeatingCoolingStateCharacteristic;
    this.currentTemperatureItem;
    this.currentTemperatureCharacteristic;
    this.targetTemperatureItem;
    this.targetTemperatureCharacteristic;
    this.temperatureDisplayUnitsCharacteristic;
    this.currentRelativeHumidityItem;
    this.currentRelativeHumidityCharacteristic;
    this.targetRelativeHumidityItem;
    this.targetRelativeHumidityCharacteristic;
    this.coolingThresholdTemperatureItem;
    this.coolingThresholdTemperatureCharacteristic;
    this.heatingThresholdTemperatureItem;
    this.heatingThresholdTemperatureCharacteristic;
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
            console.info("Automatic conversion between Celsius and Fahrenheit is active");
            this.temperatureDisplayUnitsCharacteristic.setValue(this.temperatureUnit);
            this.temperatureUnit = 1;
          }
        } else {
          console.info(this.name + ": CurrentTemperatureItem => " + item.name);
          this.currentTemperatureItem = item;
        }
      } else if (this.isItemHumidity(item)) {
        if (this.isItemSetting(item)) {
          console.info(this.name + ": TargetRelativeHumidityItem => " + item.name);
          this.targetRelativeHumidityItem = item;
        } else {
          console.info(this.name + ": CurrentRelativeHumidityItem => " + item.name);
          this.currentRelativeHumidityItem = item;
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
    this.currentHeatingCoolingStateCharacteristic = thermostatService.getCharacteristic(Characteristic.CurrentHeatingCoolingState);
    this.currentHeatingCoolingStateCharacteristic.setValue(0);

    this.targetHeatingCoolingStateCharacteristic = thermostatService.getCharacteristic(Characteristic.TargetHeatingCoolingState);
    this.targetHeatingCoolingStateCharacteristic.setValue(0);

    this.currentTemperatureCharacteristic = thermostatService.getCharacteristic(Characteristic.CurrentTemperature);
    this.currentTemperatureCharacteristic.setValue(10);

    this.targetTemperatureCharacteristic = thermostatService.getCharacteristic(Characteristic.TargetTemperature);
    this.targetTemperatureCharacteristic.setValue(10);

    this.temperatureDisplayUnitsCharacteristic = thermostatService.getCharacteristic(Characteristic.TemperatureDisplayUnits);
    this.temperatureDisplayUnitsCharacteristic.setValue(0); //defaulting to Celsius

    // Optional Characteristics
    this.currentRelativeHumidityCharacteristic = thermostatService.getCharacteristic(Characteristic.CurrentRelativeHumidity);
    this.targetRelativeHumidityCharacteristic = thermostatService.getCharacteristic(Characteristic.TargetRelativeHumidity);
    this.coolingThresholdTemperatureCharacteristic = thermostatService.getCharacteristic(Characteristic.CoolingThresholdTemperature);
    this.heatingThresholdTemperatureCharacteristic = thermostatService.getCharacteristic(Characteristic.HeatingThresholdTemperature);

    return accessory;
  };

  updateCharacteristicValue(item, characteristic, message) {
    console.info(this.name + ": updating value for " + item.name + " to " + message);
    let convertToCelsius = false;
    if (this.isItemHumidity(item)) {
      convertToCelsius = false;
    } else if (this.isItemTemperature(item)) {
      if (this.temperatureUnit == 0) {
        convertToCelsius = false;
      } else if (this.temperatureUnit == 1) {
        convertToCelsius = true;
      } else {
        convertToCelsius = false;
      }
    }
    item.updatingFromOpenHAB = true;
    characteristic.setValue(this.convertState(message, convertToCelsius));
    item.updatingFromOpenHAB = false;
  }

  getCharacteristicValue(item, callback) {
    var url = item.link + '/state?type=json';
    console.info(this.name + ": Getting value for " + item.name + " from " + url);
    console.info(JSON.stringify(item));
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
          body: this.convertState(value, false),
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
    console.info("Registering getter for " + item.name);
    characteristic.on('get', (callback) => this.getCharacteristicValue(item, callback));
  }

  registerCharacteristicSetter(item, characteristic) {
    console.info("Registering setter for " + item.name);
    characteristic.on('set', (value, callback) => this.setCharacteristicValue(item, value, callback));
  }

  registerCharacteristicUpdater(item, characteristic) {
    console.info("Registering updater for " + item.name);
    UpdateListener.addSseSubscriber(item.name, (message) => this.updateCharacteristicValue(item, characteristic, message));
  }

  registerCharacteristics() {
    if (this.currentHeatingCoolingStateItem) {
      this.registerCharacteristicUpdater(this.currentHeatingCoolingStateItem, this.currentHeatingCoolingStateCharacteristic);
      this.registerCharacteristicGetter(this.currentHeatingCoolingStateItem, this.currentHeatingCoolingStateCharacteristic);
    }

    if (this.targetHeatingCoolingStateItem) {
      this.registerCharacteristicUpdater(this.targetHeatingCoolingStateItem, this.targetHeatingCoolingStateCharacteristic);
      this.registerCharacteristicGetter(this.targetHeatingCoolingStateItem, this.targetHeatingCoolingStateCharacteristic);
      this.registerCharacteristicSetter(this.targetHeatingCoolingStateItem, this.targetHeatingCoolingStateCharacteristic);
    }

    if (this.currentTemperatureItem) {
      this.registerCharacteristicUpdater(this.currentTemperatureItem, this.currentTemperatureCharacteristic);
      this.registerCharacteristicGetter(this.currentTemperatureItem, this.currentTemperatureCharacteristic);
    }

    if (this.targetTemperatureItem) {
      this.registerCharacteristicUpdater(this.targetTemperatureItem, this.targetTemperatureCharacteristic);
      this.registerCharacteristicGetter(this.targetTemperatureItem, this.targetTemperatureCharacteristic);
      this.registerCharacteristicSetter(this.targetTemperatureItem, this.targetTemperatureCharacteristic);
    }

    if (this.currentRelativeHumidityItem) {
      this.registerCharacteristicUpdater(this.currentRelativeHumidityItem, this.currentRelativeHumidityCharacteristic);
      this.registerCharacteristicGetter(this.currentRelativeHumidityItem, this.currentRelativeHumidityCharacteristic);
    }

    if (this.targetRelativeHumidityItem) {
      this.registerCharacteristicUpdater(this.targetRelativeHumidityItem, this.targetRelativeHumidityCharacteristic);
      this.registerCharacteristicGetter(this.targetRelativeHumidityItem, this.targetRelativeHumidityCharacteristic);
      this.registerCharacteristicSetter(this.targetRelativeHumidityItem, this.targetRelativeHumidityCharacteristic);
    }

    if (this.coolingThresholdTemperatureItem) {
      console.info("coolingThresholdTemperatureItem not implemented");
    }

    if (this.heatingThresholdTemperatureItem) {
      console.info("heatingThresholdTemperatureItem not implemented");
    }
  }

  convertState(state, convertToCelsius) {
    if ('Uninitialized' === state) {
      return 0.0;
    }

    if (convertToCelsius) {
      state = (state - 32) * (5/9);
    }

    return +state;
  };
}

export { ThermostatItem };
