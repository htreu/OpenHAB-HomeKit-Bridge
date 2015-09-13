import { Accessory, Service, Characteristic, uuid } from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';

class ColorItem {
  constructor(name, url, state) {
    this.HUE = 'hue';
    this.SATURATION = "saturation";

    this.name = name;
    this.url = url;
    this.accessory = this.buildAccessory(state);
    // listen for OpenHAB updates
    this.updateCharacteristicsValue();
    this.updatingFromOpenHAB = false;
  }

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
    charactersiticOnOff.value = brightness > 0;
    charactersiticOnOff.on('set', this.updateOpenHabBrightness.bind(this));
    charactersiticOnOff.on('get', this.readOpenHabPowerState.bind(this));

    let charactersiticBrightness =
      service.addCharacteristic(Characteristic.Brightness);
    charactersiticBrightness.value = brightness;
    charactersiticBrightness.on('set', this.updateOpenHabBrightness.bind(this));
    charactersiticBrightness.on('get', this.readOpenHabBrightnessState.bind(this));

    let charactersiticHue =
      service.addCharacteristic(Characteristic.Hue);
    charactersiticHue.value = hue;
    charactersiticHue.on('set', this.updateHue.bind(this));
    charactersiticHue.on('get', this.readOpenHabHueState.bind(this));

    let charactersiticSaturation =
      service.addCharacteristic(Characteristic.Saturation);
    charactersiticSaturation.value = saturation;
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

	updateCharacteristicsValue() {
    var _this = this;
	  var ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
    // ws.on('close', function close() {
    //   console.log('disconnected: ' + _this.name);
    //   setTimeout(_this.updateCharacteristicsValue.bind(_this), 10000);
    // });
    // ws.on('error', function error() {
    //   console.log('error: ' + _this.name);
    //   setTimeout(_this.updateCharacteristicsValue.bind(_this), 10000);
    // });
	  ws.on('open', function open() {
	    console.log('open ws connection for color item ' + _this.name);
	  });
	  ws.on('message', function message(message) {
      _this.updatingFromOpenHAB = true;
      var finished = 0;
			let state = _this.parseState(message);
			let hue = +state[0];
			let saturation = +state[1];
			let brightness = +state[2];
      let power = brightness > 0;

      // set brightness
      _this.getCharacteristic(Characteristic.Brightness).setValue(brightness,
          function() { // callback to signal us iOS did process the update
            finished++;
            if (finished == 4) {
              _this.updatingFromOpenHAB = false;
            }
          }.bind(_this));
      // set hue
      _this.getCharacteristic(Characteristic.Hue).setValue(hue,
          function() { // callback to signal us iOS did process the update
            finished++;
            if (finished == 4) {
              _this.updatingFromOpenHAB = false;
            }
          }.bind(_this));
      // set saturation
      _this.getCharacteristic(Characteristic.Saturation).setValue(saturation,
          function() { // callback to signal us iOS did process the update
            finished++;
            if (finished == 4) {
              _this.updatingFromOpenHAB = false;
            }
          }.bind(_this));
      // update ON/OFF state
      _this.getCharacteristic(Characteristic.On).setValue(power,
          function() { // callback to signal us iOS did process the update
            finished++;
            if (finished == 4) {
              _this.updatingFromOpenHAB = false;
            }
          }.bind(_this));
	  });
	};

  getCharacteristic(type) {
    return this.accessory.getService(Service.Lightbulb).getCharacteristic(type);
  }

}

export { ColorItem };
