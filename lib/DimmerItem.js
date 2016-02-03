/**
 * Copyright 2016 Henning Treu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';
import debug from 'debug'; let logger = debug('DimmerItem');

import { UpdateListener } from './UpdateListener.js';

class DimmerItem {
  constructor(name, url, state) {
    this.name = name;
    this.url = url;
    this.state = state;
    this.accessory = this.buildAccessory();
    this.updatingFromOpenHAB = false;

    // listen for OpenHAB updates
    let listener = undefined;
    this.registerOpenHABListener();
  }

  registerOpenHABListener() {
    this.listener = new UpdateListener(this.url, this.updateCharacteristics.bind(this));
    this.listener.startListener();
  };

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

		let command = 0;
		if (typeof value === 'boolean') {
			command = value ? '100' : '0';
		} else {
			command = '' + value;
		}

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') {
      logger('dimmer value from iOS: ' + value + ' for ' + this.name + ', sending command to openhab: ' + command + '');
    }

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
		  if (!error && response.statusCode === 200) {
        let value = +body > 0 ? true : false;
        /* istanbul ignore next */
        if (process.env.NODE_ENV !== 'test') {
          logger('read power state: [' + body + '] ' + value + ' for ' + widgetName + ' from ' + widgetUrl);
        }
		    callback(false, value);
		  }
		});
	}

	readOpenHabBrightnessState(callback) {
    let widgetName = this.name;
    let widgetUrl = this.url;
		request(this.url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode === 200) {
        let value = +body;
        /* istanbul ignore next */
        if (process.env.NODE_ENV !== 'test') {
          logger('read brightness state: ' + value + ' for ' + widgetName + ' from ' + widgetUrl);
        }
		    callback(false, value);
		  }
		})
	}

  updateCharacteristics(message) {
    let brightness = +message;
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') {
      logger('dimmer value from openHAB: ' + message + ' for ' + this.name + ', updating iOS: ' + brightness + '');
    }

    this.updatingFromOpenHAB = true;
    let finished = 0;
    if (brightness >= 0) {
      // set brightness
      this.getCharacteristic(Characteristic.Brightness)
        .setValue(brightness,
          function() { // callback to signal us iOS did process the update
            finished++;
            if (finished === 2) {
              this.updatingFromOpenHAB = false;
            }
          }.bind(this));
      // update ON/OFF state
      this.getCharacteristic(Characteristic.On)
        .setValue(brightness > 0 ? true : false,
          function() { // callback to signal us iOS did process the update
            finished++;
            if (finished === 2) {
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
