import HAPNodeJS from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';

class DimmerItem {
  constructor(name, url, state) {
    this.name = name;
    this.url = url;
    this.state = state;
    this.accessory = this.buildAccessory();
    // listen for OpenHAB updates
    this.updateCharacteristicsValue();
    this.updatingFromOpenHAB = false;
  }

  buildAccessory() {
    let accessory = new HAPNodeJS.Accessory(this.name, HAPNodeJS.uuid.generate(this.name));

    let charactersiticOnOff = accessory
      .addService(HAPNodeJS.Service.Lightbulb, this.name)
      .getCharacteristic(HAPNodeJS.Characteristic.On);

    charactersiticOnOff.value = +this.state > 0;
    charactersiticOnOff.on('set', this.updateOpenHabItem.bind(this));
    charactersiticOnOff.on('get', this.readOpenHabPowerState.bind(this));

    let charactersiticBrightness = accessory
      .getService(HAPNodeJS.Service.Lightbulb)
      .addCharacteristic(HAPNodeJS.Characteristic.Brightness);

    charactersiticBrightness.value = +this.state;
    charactersiticBrightness.on('set', this.updateOpenHabItem.bind(this));
    charactersiticBrightness.on('get', this.readOpenHabBrightnessState.bind(this));

    return accessory;
  }

  updateOpenHabItem(value, callback) {
    if (this.updatingFromOpenHAB) {
      callback();
      return;
    }
		console.log("received dimmer value from iOS: " + value);
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
	}

	readOpenHabPowerState(callback) {
    console.log("read power state from " + this.url);
		request(this.url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    callback(+body > 0 ? true : false);
		  }
		})
	}

	readOpenHabBrightnessState(callback) {
    console.log("read brightness state from " + this.url);
		request(this.url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    callback(+body);
		  }
		})
	}

  updateCharacteristicsValue() {
    var _this = this;
	  var ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for dimmer item.');
	  });
	  ws.on('message', function(message) {
      _this.updatingFromOpenHAB = true;
      let brightness = +message;
      let finished = 0;
			if (brightness >= 0) {
				// set brightness
        _this.getCharacteristic(HAPNodeJS.Characteristic.Brightness)
					.setValue(brightness,
            function() { // callback to signal us iOS did process the update
              finished++;
              if (finished == 2) {
                _this.updatingFromOpenHAB = false;
              }
            }.bind(_this));
				// update ON/OFF state
        _this.getCharacteristic(HAPNodeJS.Characteristic.On)
          .setValue(brightness > 0 ? true : false,
            function() { // callback to signal us iOS did process the update
              finished++;
              if (finished == 2) {
                _this.updatingFromOpenHAB = false;
              }
            }.bind(_this)
          );
			}
	  });
	}

  getCharacteristic(type) {
    return this.accessory.getService(HAPNodeJS.Service.Lightbulb)
      .getCharacteristic(type);
  }

}

export { DimmerItem };
