import Types from 'HAP-NodeJS';
import WebSocket from 'ws';
import request from 'request';
var types = Types.types;

class ColorItem {
  constructor(name, url, state) {
    this.url = url;
    this.characteristicsToUpdate = {
      power: undefined,
      brightness: undefined,
      hue: undefined,
      saturation: undefined
    };

    this.displayName = name;
    this.username = "1A:2B:3C:4D:5E:FF";
    this.pincode = "031-45-154";

    var singleStates = this.parseState(state);

		var hue = +singleStates[0];
		var saturation = +singleStates[1];
		var brightness = +singleStates[2];

    this.services = [{
      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: [{
      	cType: types.NAME_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
  		format: "string",
  		initialValue: name,
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
      },{
      	cType: types.MANUFACTURER_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
  		format: "string",
  		initialValue: "openHAB",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
      },{
      	cType: types.MODEL_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
  		format: "string",
  		initialValue: "colorItem",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
      },{
      	cType: types.SERIAL_NUMBER_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
  		format: "string",
  		initialValue: "<sn>",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
      },{
      	cType: types.IDENTIFY_CTYPE,
      	onUpdate: null,
      	perms: ["pw"],
  		format: "bool",
  		initialValue: false,
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Identify Accessory",
  		designedMaxLength: 1
      }]
    },{
      sType: types.LIGHTBULB_STYPE,
      characteristics: [{
      	cType: types.NAME_CTYPE,
      	onUpdate: null,
      	perms: ["pr"],
  		format: "string",
  		initialValue: name,
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
      },{
      	cType: types.POWER_STATE_CTYPE,
        onUpdate: this.updateOpenHabBrightness.bind(this),
        onRead: this.readOpenHabPowerState.bind(this),
        onRegister: this.registerPowerCharacteristic.bind(this),
      	perms: ["pw","pr","ev"],
    		format: "bool",
    		initialValue: brightness > 0,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Turn On the Light",
    		designedMaxLength: 1
      },{
      	cType: types.HUE_CTYPE,
        onUpdate: this.updateHue.bind(this),
        onRead: this.readOpenHabHueState.bind(this),
        onRegister: this.registerHueCharacteristic.bind(this),
      	perms: ["pw","pr","ev"],
    		format: "int",
    		initialValue: hue,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Adjust Hue of Light",
    		designedMinValue: 0,
    		designedMaxValue: 360,
    		designedMinStep: 1,
    		unit: "arcdegrees"
      },{
      	cType: types.BRIGHTNESS_CTYPE,
        onUpdate: this.updateOpenHabBrightness.bind(this),
        onRead: this.readOpenHabBrightnessState.bind(this),
        onRegister: this.registerBrightnessCharacteristic.bind(this),
      	perms: ["pw","pr","ev"],
    		format: "int",
    		initialValue: brightness,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Adjust Brightness of Light",
    		designedMinValue: 0,
    		designedMaxValue: 100,
    		designedMinStep: 1,
    		unit: "%"
      },{
      	cType: types.SATURATION_CTYPE,
        onUpdate: this.updateSaturation.bind(this),
        onRead: this.readOpenHabSaturationState.bind(this),
        onRegister: this.registerSaturationCharacteristic.bind(this),
      	perms: ["pw","pr","ev"],
    		format: "int",
    		initialValue: saturation,
    		supportEvents: false,
    		supportBonjour: false,
    		manfDescription: "Adjust Saturation of Light",
    		designedMinValue: 0,
    		designedMaxValue: 100,
    		designedMinStep: 1,
    		unit: "%"
      }]
    }]
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

  updateHue(value) {
    this.updateHS(value, types.HUE_CTYPE);
  }

  updateSaturation(value) {
    this.updateHS(value, types.SATURATION_CTYPE);
  }

	updateHS(value, type) {
		var message = type === types.HUE_CTYPE ? ("hue: " + value) : ("saturation: " + value)
		console.log("received color information from iOS: " + message);
    var _this = this;
    this.getCurrentStateFromOpenHAB(function(brightness, hue, saturation) {
      hue = type === types.HUE_CTYPE ? value : hue;
      saturation = type === types.SATURATION_CTYPE ? value : saturation;
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
        }
      );
    });
	};

  getCurrentStateFromOpenHAB(callback) {
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

					callback(brightness, hue, saturation);
				}
			}
		);
  }

	updateOpenHabBrightness(value) {
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
				}
		);
	};

  registerPowerCharacteristic(accessory) {
    console.log("power register called");
    this.characteristicsToUpdate.power = accessory;
    this.characteristicRegistered();
  }

  registerBrightnessCharacteristic(accessory) {
    console.log("brightness register called");
    this.characteristicsToUpdate.brightness = accessory;
    this.characteristicRegistered();
  }

  registerHueCharacteristic(accessory) {
    console.log("brightness register called");
    this.characteristicsToUpdate.hue = accessory;
    this.characteristicRegistered();
  }

  registerSaturationCharacteristic(accessory) {
    console.log("brightness register called");
    this.characteristicsToUpdate.saturation = accessory;
    this.characteristicRegistered();
  }

  characteristicRegistered() {
    if (this.characteristicsToUpdate.power != undefined
      && this.characteristicsToUpdate.brightness != undefined
      && this.characteristicsToUpdate.hue != undefined
      && this.characteristicsToUpdate.saturation != undefined )
    {
      this.updateCharacteristicsValue();
    }
  }

	updateCharacteristicsValue(url, updateCharacteristics) {
    var _this = this;
	  var ws = new WebSocket(this.url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for color item.');
	  });
	  ws.on('message', function(message) {
			var state =_this.parseState(message);
			var hue = +state[0];
			var saturation = +state[1];
			var brightness = +state[2];

			_this.characteristicsToUpdate.hue
				.updateValue(hue);
			_this.characteristicsToUpdate.saturation
				.updateValue(saturation);
			_this.characteristicsToUpdate.brightness
				.updateValue(brightness);

			// update ON/OFF state
			_this.characteristicsToUpdate.power
					.updateValue(brightness > 0 ? true : false);
	  });
	};

}

export { ColorItem };
