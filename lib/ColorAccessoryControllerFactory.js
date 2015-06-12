var colorItem = require('./ColorItem.js').colorItem;
var WebSocket  = require('ws');
var request    = require('request');
var HAPNodeJS  = require("HAP-NodeJS");

var types                      = HAPNodeJS.types;
var accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
var service_Factor             = HAPNodeJS.serviceFactory;
var characteristic_Factor      = HAPNodeJS.characteristicFactory;

function createColorAccessoryController(colorWidget) {
	// deep copy the template switch item
	var colorItemTemplate = JSON.parse(JSON.stringify(colorItem));
  return publishAccessory(colorItemTemplate, colorWidget);
}

function publishAccessory(template, openHABcolorWidget) {
  var name = openHABcolorWidget.name;
  var url = openHABcolorWidget.link;
	var state = parseState(openHABcolorWidget.state);

	var hue = +state[0];
	var saturation = +state[1];
	var brightness = +state[2];

  var informationService = getService(template, types.ACCESSORY_INFORMATION_STYPE);
  var nameCharacteristic = getCharacteristic(informationService, types.NAME_CTYPE);
  nameCharacteristic.initialValue = name;

  var lightbulbService = getService(template, types.LIGHTBULB_STYPE);
  var nameCharacteristic = getCharacteristic(lightbulbService, types.NAME_CTYPE);
  nameCharacteristic.initialValue = name;

  var powerStateCharacteristic = getCharacteristic(lightbulbService, types.POWER_STATE_CTYPE);
  powerStateCharacteristic.initialValue = brightness > 0 ? true : false;
  powerStateCharacteristic.onUpdate = function (value) {
    updateOpenHabItem(url, value);
  };

	var hueCharacteristic = getCharacteristic(lightbulbService, types.HUE_CTYPE);
	hueCharacteristic.initialValue = hue;
	hueCharacteristic.onUpdate = function(value) {
		updateOpenHabItem(url, value);
	};

	var saturationCharacteristic = getCharacteristic(lightbulbService, types.SATURATION_CTYPE);
	saturationCharacteristic.initialValue = saturation;
	saturationCharacteristic.onUpdate = function(value) {
		updateOpenHabItem(url, value);
	};

	var brightnessCharacteristic = getCharacteristic(lightbulbService, types.BRIGHTNESS_CTYPE);
	brightnessCharacteristic.initialValue = brightness;
	brightnessCharacteristic.onUpdate = function(value) {
		updateOpenHabItem(url, value);
	};

	var updateCharacteristics = {};
  var accessoryController = new accessoryController_Factor.AccessoryController();
  for (var j = 0; j < template.services.length; j++) {
      var service = new service_Factor.Service(template.services[j].sType);

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
            new characteristic_Factor.Characteristic(options, characteristicTemplate.onUpdate);

          if (options.type === types.POWER_STATE_CTYPE
							|| options.type === types.HUE_CTYPE
							|| options.type === types.SATURATION_CTYPE
					    || options.type === types.BRIGHTNESS_CTYPE
							) {
						updateCharacteristics[options.type] = characteristic;

          }
          service.addCharacteristic(characteristic);
      };

      accessoryController.addService(service);
  }

	updateCharacteristicsValue(url, updateCharacteristics);

  return accessoryController;
};

function parseState(state) {
	var regex = /[\.\d]+/g;
	var result = [];
	while (v = regex.exec(state)) {
		result.push(v);
	}

	return result;
}

function updateOpenHabItem(url, value) {
	console.log("received color value from iOS: " + value);
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

function updateCharacteristicsValue(url, updateCharacteristics) {
  var ws = new WebSocket(url.replace('http:', 'ws:') + '/state?type=json');
  ws.on('open', function() {
    console.log('open ws connection for color item.');
  });
  ws.on('message', function(message) {
		console.log('received color information from openHAB: ' + message);

		var state = parseState(message);
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

function getService(accessory, serviceType) {
  return accessory.services.filter( function(value) {
    return value.sType === serviceType;
  })[0];
};

function getCharacteristic(service, characteristicType) {
  return service.characteristics.filter(function (value) {
    return value.cType === characteristicType;
  })[0];
};

module.exports = {
  createColorAccessoryController: createColorAccessoryController
}
