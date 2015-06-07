var dimmerItem = require('./DimmerItem.js').dimmerItem;
var WebSocket  = require('ws');
var request    = require('request');
var HAPNodeJS  = require("HAP-NodeJS");

var types                      = HAPNodeJS.types;
var accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
var service_Factor             = HAPNodeJS.serviceFactory;
var characteristic_Factor      = HAPNodeJS.characteristicFactory;

function createDimmerAccessoryController(dimmerWidget) {
	// deep copy the template switch item
	var dimmerItemTemplate = JSON.parse(JSON.stringify(dimmerItem));
  return publishAccessory(dimmerItemTemplate, dimmerWidget);
}

function publishAccessory(template, openHABdimmerWidget) {
  var name = openHABdimmerWidget.name;
  var url = openHABdimmerWidget.link;
  var state = openHABdimmerWidget.state;

  var informationService = getService(template, types.ACCESSORY_INFORMATION_STYPE);
  var nameCharacteristic = getNameCharacteristic(informationService);
  nameCharacteristic.initialValue = name;

  var lightbulbService = getService(template, types.LIGHTBULB_STYPE);
  var nameCharacteristic = getNameCharacteristic(lightbulbService);
  nameCharacteristic.initialValue = name;

  var powerStateCharacteristic = getPowerStateCharacteristic(lightbulbService);
  powerStateCharacteristic.initialValue = state === 'ON' ? true : false;
  powerStateCharacteristic.onUpdate = function (value) {
    updateOpenHabItem(url, value);
  };

	var brightnessCharacteristic = getBrightnessCharacteristic(lightbulbService);
	brightnessCharacteristic.initialValue = +state;
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
					    || options.type === types.BRIGHTNESS_CTYPE) {
						updateCharacteristics[options.type] = characteristic;

          }
          service.addCharacteristic(characteristic);
      };

      accessoryController.addService(service);
  }

	updateCharacteristicsValue(url, updateCharacteristics);

  return accessoryController;
};

function updateOpenHabItem(url, value) {
	console.log("received dimmer value from iOS: " + value);
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
    console.log('open ws connection for dimmer item.');
  });
  ws.on('message', function(message) {
		if ((+message) >= 0) {
			var brightness = +message;
			// set brightness
			updateCharacteristics[types.BRIGHTNESS_CTYPE]
				.updateValue(brightness);
			// update ON/OFF state
			updateCharacteristics[types.POWER_STATE_CTYPE]
					.updateValue(brightness > 0 ? true : false);
		}
  });
};

function getService(accessory, type) {
  return accessory.services.filter( function(value) {
    return value.sType === type;
  })[0];
};

function getNameCharacteristic(service) {
  return service.characteristics.filter(function (value) {
    return value.cType === types.NAME_CTYPE;
  })[0];
};

function getPowerStateCharacteristic(service) {
  return service.characteristics.filter(function (value) {
    return value.cType === types.POWER_STATE_CTYPE;
  })[0];
};

function getBrightnessCharacteristic(service) {
  return service.characteristics.filter(function (value) {
    return value.cType === types.BRIGHTNESS_CTYPE;
  })[0];
};

module.exports = {
  createDimmerAccessoryController: createDimmerAccessoryController
}
