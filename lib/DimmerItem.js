'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';
import { OhItem } from './OhItem.js';

class DimmerItem extends OhItem {
  constructor(name, url, state, ohVersion) {
    super(name, url, state, ohVersion);
    this.accessory = this.buildAccessory();
    this.updatingFromOpenHAB = false;
  }

  buildAccessory() {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let charactersiticOnOff = accessory
      .addService(Service.Lightbulb, this.name)
      .getCharacteristic(Characteristic.On);

    charactersiticOnOff.setValue(+this.state > 0);
    charactersiticOnOff.on('set', this.updateOpenHabItem.bind(this));
    charactersiticOnOff.on('get', this.readOpenHabPowerState.bind(this));

    let charactersiticBrightness = accessory
      .getService(Service.Lightbulb)
      .addCharacteristic(Characteristic.Brightness);

    charactersiticBrightness.setValue(+this.state);
    charactersiticBrightness.on('set', this.updateOpenHabItem.bind(this));
    charactersiticBrightness.on('get', this.readOpenHabBrightnessState.bind(this));

    return accessory;
  }

  updateOpenHabItem(value, callback) {
    if (this.updatingFromOpenHAB) {
      callback();
      return;
    }

		var command = 0;
		if (typeof value === 'boolean') {
			command = value ? '100' : '0';
		} else {
			command = "" + value;
		}

    console.log("dimmer value from iOS: '" + value + "' for " + this.name + ", sending command to openhab: '" + command + "");

		request.post(
				this.url,
				{ body: command },
				function (error, response, body) {
						callback();
				}
		);
	}

	readOpenHabPowerState(callback) {
    let widgetName = this.name;
    let widgetUrl = this.url;

		request(this.url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
        let value = +body > 0 ? true : false;
        console.log("read power state: '" + value + "' for " + widgetName + " from " + widgetUrl);
		    callback(value);
		  }
		})
	}

	readOpenHabBrightnessState(callback) {
    let widgetName = this.name;
    let widgetUrl = this.url;
		request(this.url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
        let value = +body;
        console.log("read brightness state: '" + value + "' for " + widgetName + " from " + widgetUrl);
		    callback(value);
		  }
		})
	}

  updateCharacteristics(message) {
    let brightness = +message;
    console.log("dimmer value from openHAB: '" + message + "' for " + this.name + ", updating iOS: '" + brightness + "");

    this.updatingFromOpenHAB = true;
    let finished = 0;
    if (brightness >= 0) {
      // set brightness
      this.getCharacteristic(Characteristic.Brightness)
        .setValue(brightness,
          function() { // callback to signal us iOS did process the update
            finished++;
            if (finished == 2) {
              this.updatingFromOpenHAB = false;
            }
          }.bind(this));
      // update ON/OFF state
      this.getCharacteristic(Characteristic.On)
        .setValue(brightness > 0 ? true : false,
          function() { // callback to signal us iOS did process the update
            finished++;
            if (finished == 2) {
              this.updatingFromOpenHAB = false;
            }
          }.bind(this));
    }
	}

  getCharacteristic(type) {
    return this.accessory.getService(Service.Lightbulb)
      .getCharacteristic(type);
  }

}

export { DimmerItem };
