'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';
import debug from 'debug'; let logger = debug('SwitchItem');

import { UpdateListener } from './UpdateListener.js';

class SwitchItem {
  constructor(name, url, state) {
    this.name = name;
    this.url = url;
    this.accessory = this.buildAccessory(state);
    this.updatingFromOpenHAB = false;

    // listen for OpenHAB updates
    this.listener = undefined;
    this.registerOpenHABListener();
  };

  buildAccessory(state) {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let charactersiticOnOff = accessory
      .addService(Service.Lightbulb, this.name)
      .getCharacteristic(Characteristic.On);

    charactersiticOnOff.setValue(state === 'ON');

    charactersiticOnOff.on('set', this.updateOpenHabItem.bind(this));
    charactersiticOnOff.on('get', this.readOpenHabPowerState.bind(this));

    return accessory;
  };

  registerOpenHABListener() {
    this.listener = new UpdateListener(this.url, this.updateCharacteristics.bind(this));
    this.listener.startListener();
  };

  updateCharacteristics(message) {
    let command = message === 'ON' ? true : false;

    /* istanbul ignore next */
    if (process.env.NODE_ENV != 'test') {
      logger("switch value from openHAB: '" + message + "' for " + this.name + ", updating iOS: '" + command + "");
    }
    this.updatingFromOpenHAB = true;
    this.accessory.getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On)
        .setValue(command,
          function() { // callback to signal us iOS did process the update
            this.updatingFromOpenHAB = false;
          }.bind(this)
        );
  };

  readOpenHabPowerState(callback) {
    let widgetName = this.name;
    let widgetUrl = this.url;
    request(this.url + '/state?type=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let value = body === "ON" ? true : false;
        /* istanbul ignore next */
        if (process.env.NODE_ENV != 'test') {
          logger("read power state: '[" + body + "] " + value + "' for " + widgetName + " from " + widgetUrl);
        }
        callback(false, value);
      }
    })
  };

  updateOpenHabItem(value, callback) {
    if (this.updatingFromOpenHAB) {
      callback();
      return;
    }

    let command = value ? 'ON' : 'OFF';
    /* istanbul ignore next */
    if (process.env.NODE_ENV != 'test') {
      logger("switch value from iOS: '" + value + "' for " + this.name + ", sending command to openhab: '" + command + "");
    }

    request.post(
        this.url,
        { body: command },
        function (error, response, body) {
            callback(); // we are done updating the switch item in OpenHAB
        }
    );
  };
}

export { SwitchItem };
