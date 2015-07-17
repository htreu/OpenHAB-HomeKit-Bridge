import rollershutterItem from './RollershutterItem.js';
import WebSocket from 'ws';
import request from 'request';
import HAPNodeJS from 'HAP-NodeJS';

var types                      = HAPNodeJS.types;
var accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
var service_Factor             = HAPNodeJS.serviceFactory;
var characteristic_Factor      = HAPNodeJS.characteristicFactory;

function createRollershutterAccessoryController(rollershutterWidget) {
	// deep copy the template switch item
	var rollershutterItemTemplate = JSON.parse(JSON.stringify(rollershutterItem.item));
  return publishAccessory(rollershutterItemTemplate, rollershutterWidget);
}

function publishAccessory(template, openHABRollershutterWidget) {
  var name = openHABRollershutterWidget.name;
  var url = openHABRollershutterWidget.link;
  var state = openHABRollershutterWidget.state;

  var informationService = getService(template, types.ACCESSORY_INFORMATION_STYPE);
  var nameCharacteristic = getCharacteristic(informationService, types.NAME_CTYPE);
  nameCharacteristic.initialValue = name;

  var windowCoveringService = getService(template, types.WINDOW_COVERING_STYPE);
  var nameCharacteristic = getCharacteristic(windowCoveringService, types.NAME_CTYPE);
  nameCharacteristic.initialValue = name;

  var targetPositionCharacteristic = getCharacteristic(windowCoveringService, types.WINDOW_COVERING_TARGET_POSITION_CTYPE);
  targetPositionCharacteristic.initialValue = state;
  targetPositionCharacteristic.onUpdate = function (value) {
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

          if (options.type === types.WINDOW_COVERING_TARGET_POSITION_CTYPE) {
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
	console.log("received rollershutter value from iOS: " + value);
	var command = value;
	
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
    console.log('open ws connection for rollershutter item.');
  });
  ws.on('message', function(message) {
		var position = message;
		// set brightness
		updateCharacteristics[types.WINDOW_COVERING_TARGET_POSITION_CTYPE]
			.updateValue(position);
  });
};

function getService(accessory, type) {
  return accessory.services.filter( function(value) {
    return value.sType === type;
  })[0];
};

function getCharacteristic(service, characteristicType) {
  return service.characteristics.filter(function (value) {
    return value.cType === characteristicType;
  })[0];
};

module.exports = {
  createRollershutterAccessoryController: createRollershutterAccessoryController
}
