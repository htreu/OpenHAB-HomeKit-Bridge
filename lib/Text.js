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
import debug from 'debug'; let logger = debug('Text');

import { CustomServices, CustomCharacteristics } from './CustomHomeKitTypes.js';
import { UpdateListener } from './UpdateListener.js';
import { OpenHABBridge } from './openHABBridge.js'
import { RestClient } from './RestClient.js'
import { SitemapParser } from './SitemapParser.js';

class Text {
  constructor(name, url, state, itemType) {
    this.textType = this.inferredTextType(name, itemType);

    // Remove formatted value from name (label)
    this.name = this.labelName(name);
    this.url = url;
    this.accessory = this.buildAccessory(state, name);
    this.listener = undefined;

    // listen for OpenHAB updates
    this.registerOpenHABListener();
  };

  inferredTextType(name, itemType) {
    let lowerName = name.toLowerCase();

    // Contact sensor text item
    if ('ContactItem' === itemType) {
      return 'contact';
    }

    // Temperature text item
    let looksLikeTemp = lowerName.match(/(temperature|temp([^\w]|$))/)
      || this.labelValue(lowerName).match(/[\d+\.]+\s*(\xB0|f|c)/);
    if ('NumberItem' === itemType && looksLikeTemp) {
      return 'temperature';
    }

    // Fall back to generic text item
    return 'generic';
  };

  registerOpenHABListener() {
    this.listener = new UpdateListener(this.url, this.updateCharacteristics.bind(this));
    this.listener.startListener();
  };

  buildAccessory(state, name) {
    let accessory = new Accessory(this.name,
      uuid.generate(this.constructor.name + this.name));

    let service = CustomServices.TextInfoService;
    let characteristic = CustomCharacteristics.TextInfoCharacteristic;
    let initialValue = this.labelValue(name);

    switch (this.textType) {

    case 'contact':
      service = Service.ContactSensor;
      characteristic = Characteristic.ContactSensorState;
      initialValue = this.stateValue(state);
      break;

    case 'temperature':
      service = Service.TemperatureSensor;
      characteristic = Characteristic.CurrentTemperature;
      initialValue = this.stateValue(state);
    }

    this.characteristic = accessory.addService(service, this.name).getCharacteristic(characteristic);
    this.characteristic.on('get', this.readOpenHabText.bind(this));
    this.characteristic.setValue(initialValue);

    return accessory;
  };

  updateCharacteristics(message, callback) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') {
      logger('text widget received message: ' + message);
    }

    switch (this.textType) {
    case 'contact':
    case 'temperature':
      let value = this.stateValue(message);
      this.characteristic.setValue(value);
      if (callback) {
        callback(value);
      }
      break;

    default:
      let characteristic = this.characteristic
      this.readOpenHabText(function (err, value) {
        characteristic.setValue(value);
        if (callback) {
          callback(value);
        }
      });
    }
  };

  readOpenHabText(callback) {
    switch (this.textType) {
    case 'contact':
    case 'temperature':
      this.readStateValue(callback);
      break;
    default:
      this.readLabelValue(callback);
    }
  };

  readStateValue(callback) {
    let widgetName = this.name;
    let widgetUrl = this.url;
    let stateValue = this.stateValue.bind(this);

    request(this.url + '/state?type=json', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let value = stateValue(body);
        /* istanbul ignore next */
        if (process.env.NODE_ENV !== 'test') {
          logger('read temperature state: [' + body + '] ' + value + ' for ' + widgetName + ' from ' + widgetUrl);
        }
        callback(false, value);
      }
    });
  };

  readLabelValue(callback) {
    // To get the formatted text element string for generic text,
    // we need to look at the element label rather than the item state
    let widgetUrl = this.url;
    let widgetName = this.name;
    let labelValue = this.labelValue.bind(this);
    let labelName = this.labelName;
    let bridge = OpenHABBridge.getInstance();

    new RestClient().fetchSitemap(bridge.serverAddress, bridge.sitemapName, function (error, sitemap) {
      let elements = new SitemapParser().parseSitemap(sitemap);
      elements.forEach(function(element) {
        if (element.link === widgetUrl && element.type === 'Text' && labelName(element.name) === widgetName) {
          let value = labelValue(element.name);
          /* istanbul ignore next */
          if (process.env.NODE_ENV !== 'test') {
            logger('read label state: ' + value + ' for ' + widgetName);
          }
          callback(false, value);
        }
      });
    });
  };

  labelValue(label) {
    return label.replace(/.*\[/, '').replace(/\].*/, '');
  };

  stateValue(state) {
    switch (this.textType) {

    case 'temperature':
      if ('Uninitialized' === state) {
        return 0.0;
      }
      return +state;

    case 'contact':
      if ('CLOSED' === state) {
        return Characteristic.ContactSensorState.CONTACT_DETECTED;
      }
      // fall back to 'no contact' if uninitialized or OPEN
      return Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;

    default:
      // For generic text values, we use labels rather than state
      return '';
    }
  };

  labelName(name) {
    return name.replace(/\s*\[[^\]]+\]/g, '');
  };

}

export { Text };
