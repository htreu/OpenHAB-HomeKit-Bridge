'use strict';
import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import request from 'request';

import { UpdateListener } from './UpdateListener.js';

class ColorItem {
  constructor(name, url, state) {
    this.HUE = 'hue';
    this.SATURATION = "saturation";

    this.name = name;
    this.url = url;
    this.accessory = this.buildAccessory(state);
    this.updatingFromOpenHAB = false;

    // listen for OpenHAB updates
    this.listener = undefined;
    this.registerOpenHABListener();
  }

  registerOpenHABListener() {
    this.listener = new UpdateListener(this.url, this.updateCharacteristics.bind(this));
    this.listener.startListener();
  };

  buildAccessory(state) {
    let accessory = new Accessory(
      this.name, uuid.generate(this.name));

    let singleStates = this.parseState(state);
    let hue = +singleStates[0];
    let saturation = +singleStates[1];
    let brightness = +singleStates[2];

    let service = accessory.addService(Service.Lightbulb, this.name);

    let charactersiticOnOff =
      service.getCharacteristic(Characteristic.On);
    charactersiticOnOff.setValue(brightness > 0);
    charactersiticOnOff.on('set', this.updateOpenHabBrightness.bind(this));
    charactersiticOnOff.on('get', this.readOpenHabPowerState.bind(this));

    let charactersiticBrightness =
      service.addCharacteristic(Characteristic.Brightness);
    charactersiticBrightness.setValue(brightness);
    charactersiticBrightness.on('set', this.updateOpenHabBrightness.bind(this));
    charactersiticBrightness.on('get', this.readOpenHabBrightnessState.bind(this));

    let charactersiticHue =
      service.addCharacteristic(Characteristic.Hue);
    charactersiticHue.setValue(hue);
    charactersiticHue.on('set', this.updateHue.bind(this));
    charactersiticHue.on('get', this.readOpenHabHueState.bind(this));

    let charactersiticSaturation =
      service.addCharacteristic(Characteristic.Saturation);
    charactersiticSaturation.setValue(saturation);
    charactersiticSaturation.on('set', this.updateSaturation.bind(this));
    charactersiticSaturation.on('get', this.readOpenHabSaturationState.bind(this));

    return accessory;
  }

  readOpenHabPowerState(callback) {
    console.log("ColorItem: read power state called");
    this.getCurrentStateFromOpenHAB(function(brightness, hue, saturation) {
      callback(brightness > 0 ? true : false);
    });
  }

  readOpenHabBrightnessState(callback) {
    console.log("ColorItem: read brightness state called");
    this.getCurrentStateFromOpenHAB(function(brightness, hue, saturation) {
      callback(brightness);
    });
  }

  readOpenHabHueState(callback) {
    console.log("ColorItem: read hue state called");
    this.getCurrentStateFromOpenHAB(function(brightness, hue, saturation) {
      callback(hue);
    });
  }

  readOpenHabSaturationState(callback) {
    console.log("ColorItem: read saturation state called");
    this.getCurrentStateFromOpenHAB(function(brightness, hue, saturation) {
      callback(saturation);
    });
  }

  parseState(state) {
		var regex = /[\.\d]+/g;
		var result = [];
		var v;
		while (v = regex.exec(state)) {
			result.push(v);
		}

		return result;
	}

  updateHue(value, callback) {
    this.updateHS(value, this.HUE, callback);
  }

  updateSaturation(value, callback) {
    this.updateHS(value, this.SATURATION, callback);
  }

	updateHS(value, type, callback) {
    if (this.updatingFromOpenHAB) {
      callback();
      return;
    }
		var message = type === this.HUE ? ("hue: " + value) : ("saturation: " + value)
		console.log("received color information from iOS: " + message);
    var _this = this;
    this.getCurrentStateFromOpenHAB(function(brightness, hue, saturation) {
      hue = type === _this.HUE ? value : hue;
      saturation = type === _this.SATURATION ? value : saturation;
      var command = hue + "," + saturation + "," + brightness;
      console.log("sending color command to openHAB: " + command);
      request.post(
        _this.url,
        {
          body: command,
          headers: {'Content-Type': 'text/plain'}
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body)
          }
          callback();
        }
      );
    });
	};

	updateOpenHabBrightness(value, callback) {
    if (this.updatingFromOpenHAB) {
      callback();
      return;
    }
		console.log("received brightness value from iOS: " + value);
		var command = 0;
		if (typeof value === 'boolean') {
			command = value ? '100' : '0';
		} else {
			command = "" + value;
		}
		request.post(
			this.url,
			{
				body: command,
				headers: {'Content-Type': 'text/plain'}
			},
			function (error, response, body) {
					if (!error && response.statusCode == 200) {
							console.log(body)
					}
          callback();
			}
		);
  };

  getCurrentStateFromOpenHAB(updateValues) {
    // request current HSB state from openHAB:
    var _this = this;
		request.get(
			this.url + '/state',
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// update Hue or Saturation according to 'value' and the rtetreived data:
					console.log("received color information from openHAB: " + body);
					var state = _this.parseState(body);
					var hue = state[0];
					var saturation = state[1];
					var brightness = state[2];

					updateValues(brightness, hue, saturation);
				}
			}
		);
  }

	updateCharacteristics(message) {
    this.updatingFromOpenHAB = true;
    var finished = 0;
    let state = this.parseState(message);
    let hue = +state[0];
    let saturation = +state[1];
    let brightness = +state[2];
    let power = brightness > 0;

    // set brightness
    this.getCharacteristic(Characteristic.Brightness).setValue(brightness,
      function() { // callback to signal us iOS did process the update
        finished++;
        if (finished == 4) {
          this.updatingFromOpenHAB = false;
        }
      }.bind(this)
    );
    // set hue
    this.getCharacteristic(Characteristic.Hue).setValue(hue,
      function() { // callback to signal us iOS did process the update
        finished++;
        if (finished == 4) {
          this.updatingFromOpenHAB = false;
        }
      }.bind(this)
    );
    // set saturation
    this.getCharacteristic(Characteristic.Saturation).setValue(saturation,
      function() { // callback to signal us iOS did process the update
        finished++;
        if (finished == 4) {
          this.updatingFromOpenHAB = false;
        }
      }.bind(this)
    );
    // update ON/OFF state
    this.getCharacteristic(Characteristic.On).setValue(power,
      function() { // callback to signal us iOS did process the update
        finished++;
        if (finished == 4) {
          this.updatingFromOpenHAB = false;
        }
      }.bind(this)
    );
	};

  getCharacteristic(type) {
    return this.accessory.getService(Service.Lightbulb).getCharacteristic(type);
  }

}

export { ColorItem };
