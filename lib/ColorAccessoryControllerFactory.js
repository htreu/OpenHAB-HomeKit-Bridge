import colorItem from './ColorItem.js';
import WebSocket from 'ws';
import request from 'request';
import HAPNodeJS from 'HAP-NodeJS';

var types = HAPNodeJS.types;

class ColorAccessoryControllerFactory {
	constructor() {
		this.types                      = HAPNodeJS.types;
		this.accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
		this.service_Factor             = HAPNodeJS.serviceFactory;
		this.characteristic_Factor      = HAPNodeJS.characteristicFactory;
	}

	createColorAccessoryController(colorWidget) {
		// deep copy the template switch item
		var colorItemTemplate = JSON.parse(JSON.stringify(colorItem.item));
	  return this.publishAccessory(colorItemTemplate, colorWidget);
	}

	publishAccessory(template, openHABcolorWidget) {
	  var name = openHABcolorWidget.name;
	  var url = openHABcolorWidget.link;
		var state = ColorAccessoryControllerFactory.parseState(openHABcolorWidget.state);

		var hue = +state[0];
		var saturation = +state[1];
		var brightness = +state[2];

	  var informationService = this.getService(template, this.types.ACCESSORY_INFORMATION_STYPE);
	  var nameCharacteristic = this.getCharacteristic(informationService, this.types.NAME_CTYPE);
	  nameCharacteristic.initialValue = name;

	  var lightbulbService = this.getService(template, this.types.LIGHTBULB_STYPE);
	  var nameCharacteristic = this.getCharacteristic(lightbulbService, this.types.NAME_CTYPE);
	  nameCharacteristic.initialValue = name;

	  var powerStateCharacteristic = this.getCharacteristic(lightbulbService, this.types.POWER_STATE_CTYPE);
	  powerStateCharacteristic.initialValue = brightness > 0 ? true : false;
	  powerStateCharacteristic.onUpdate = function (value) {
			this.updateOpenHabBrightness(url, value);
	  };

		var hueCharacteristic = this.getCharacteristic(lightbulbService, this.types.HUE_CTYPE);
		hueCharacteristic.initialValue = hue;
		hueCharacteristic.onUpdate = function(value) {
			this.updateHS(url, value, this.types.HUE_CTYPE);
		};

		var saturationCharacteristic = this.getCharacteristic(lightbulbService, this.types.SATURATION_CTYPE);
		saturationCharacteristic.initialValue = saturation;
		saturationCharacteristic.onUpdate = function(value) {
			this.updateHS(url, value, this.types.SATURATION_CTYPE);
		};

		var brightnessCharacteristic = this.getCharacteristic(lightbulbService, this.types.BRIGHTNESS_CTYPE);
		brightnessCharacteristic.initialValue = brightness;
		brightnessCharacteristic.onUpdate = function(value) {
			this.updateOpenHabBrightness(url, value);
		};

		var updateCharacteristics = {};
	  var accessoryController = new this.accessoryController_Factor.AccessoryController();
	  for (var j = 0; j < template.services.length; j++) {
	      var service = new this.service_Factor.Service(template.services[j].sType);

	      //loop through characteristics
	      for (var k = 0; k < template.services[j].characteristics.length; k++) {
	          var characteristicTemplate = template.services[j].characteristics[k];
	          var options = {
	              type: characteristicTemplate.cType,
	              perms: characteristicTemplate.perms,
	              format: characteristicTemplate.format,
	              initialValue: characteristicTemplate.initialValue,
	              supportEvents: characteristicTemplate.supportEvents,
	              supportBonjour: characteristicTemplate.supportBonjour,
	              manfDescription: characteristicTemplate.manfDescription,
	              designedMaxLength: characteristicTemplate.designedMaxLength,
	              designedMinValue: characteristicTemplate.designedMinValue,
	              designedMaxValue: characteristicTemplate.designedMaxValue,
	              designedMinStep: characteristicTemplate.designedMinStep,
	              unit: characteristicTemplate.unit,
	          }
	          var characteristic =
	            new this.characteristic_Factor.Characteristic(options, characteristicTemplate.onUpdate);

	          if (options.type === this.types.POWER_STATE_CTYPE
								|| options.type === this.types.HUE_CTYPE
								|| options.type === this.types.SATURATION_CTYPE
						    || options.type === this.types.BRIGHTNESS_CTYPE
								) {
							updateCharacteristics[options.type] = characteristic;

	          }
	          service.addCharacteristic(characteristic);
	      };

	      accessoryController.addService(service);
	  }

		this.updateCharacteristicsValue(url, updateCharacteristics);

	  return accessoryController;
	};

	static parseState(state) {
		var regex = /[\.\d]+/g;
		var result = [];
		var v;
		while (v = regex.exec(state)) {
			result.push(v);
		}

		return result;
	}

	updateHS(url, value, type) {
		var message = type === this.types.HUE_CTYPE ? ("hue: " + value) : ("saturation: " + value)
		console.log("received color information from iOS: " + message);

		// request current HSB state from openHAB:
		request.get(
			url + '/state',
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// update Hue or Saturation according to 'value' and the rtetreived data:
					console.log("received color information from openHAB: " + body);
					var state = parseState(body);
					var hue = type === this.types.HUE_CTYPE ? value : state[0];
					var saturation = type === this.types.SATURATION_CTYPE ? value : state[1];
					var brightness = state[2];

					var command = hue + "," + saturation + "," + brightness;
					console.log("sending command to openHAB: " + command);
					request.post(
						url,
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
				}
			}
		);
	};

	updateOpenHabBrightness(url, value) {
		console.log("received brightness value from iOS: " + value);
		var command = 0;
		if (typeof value === 'boolean') {
			command = value ? '100' : '0';
		} else {
			command = "" + value;
		}
		request.post(
				url,
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

	updateCharacteristicsValue(url, updateCharacteristics) {
	  var ws = new WebSocket(url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for color item.');
	  });
	  ws.on('message', function(message) {
			var state = ColorAccessoryControllerFactory.parseState(message);
			var hue = +state[0];
			var saturation = +state[1];
			var brightness = +state[2];

			updateCharacteristics[types.HUE_CTYPE]
				.updateValue(hue);
			updateCharacteristics[types.SATURATION_CTYPE]
				.updateValue(saturation);
			updateCharacteristics[types.BRIGHTNESS_CTYPE]
				.updateValue(brightness);

			// update ON/OFF state
			updateCharacteristics[types.POWER_STATE_CTYPE]
					.updateValue(brightness > 0 ? true : false);
	  });
	};

	getService(accessory, serviceType) {
	  return accessory.services.filter( function(value) {
	    return value.sType === serviceType;
	  })[0];
	};

	getCharacteristic(service, characteristicType) {
	  return service.characteristics.filter(function (value) {
	    return value.cType === characteristicType;
	  })[0];
	};
}

export { ColorAccessoryControllerFactory };
