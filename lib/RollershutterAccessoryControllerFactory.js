import rollershutterItem from './RollershutterItem.js';
import WebSocket from 'ws';
import request from 'request';
import HAPNodeJS from 'HAP-NodeJS';

class  RollershutterAccessoryControllerFactory {
	constructor() {
		this.types                      = HAPNodeJS.types;
		this.accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
		this.service_Factor             = HAPNodeJS.serviceFactory;
		this.characteristic_Factor      = HAPNodeJS.characteristicFactory;
	}

	createRollershutterAccessoryController(rollershutterWidget) {
		// deep copy the template switch item
		var rollershutterItemTemplate = JSON.parse(JSON.stringify(rollershutterItem.item));
	  return this.publishAccessory(rollershutterItemTemplate, rollershutterWidget);
	}

	publishAccessory(template, openHABRollershutterWidget) {
	  var name = openHABRollershutterWidget.name;
	  var url = openHABRollershutterWidget.link;
	  var state = openHABRollershutterWidget.state;

	  var informationService = this.getService(template, this.types.ACCESSORY_INFORMATION_STYPE);
	  var nameCharacteristic = this.getCharacteristic(informationService, this.types.NAME_CTYPE);
	  nameCharacteristic.initialValue = name;

	  var windowCoveringService = this.getService(template, this.types.WINDOW_COVERING_STYPE);
	  var nameCharacteristic = this.getCharacteristic(windowCoveringService, this.types.NAME_CTYPE);
	  nameCharacteristic.initialValue = name;

	  var targetPositionCharacteristic = this.getCharacteristic(windowCoveringService, this.types.WINDOW_COVERING_TARGET_POSITION_CTYPE);
	  targetPositionCharacteristic.initialValue = state;
	  targetPositionCharacteristic.onUpdate = function (value) {
	    this.updateOpenHabItem(url, value);
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

	          if (options.type === this.types.WINDOW_COVERING_TARGET_POSITION_CTYPE) {
							updateCharacteristics[options.type] = characteristic;
	          }
	          service.addCharacteristic(characteristic);
	      };

	      accessoryController.addService(service);
	  }

		this.updateCharacteristicsValue(url, updateCharacteristics);

	  return accessoryController;
	};

	updateOpenHabItem(url, value) {
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

	updateCharacteristicsValue(url, updateCharacteristics) {
	  var ws = new WebSocket(url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for rollershutter item.');
	  });
	  ws.on('message', function(message) {
			var position = message;
			// set brightness
			updateCharacteristics[this.types.WINDOW_COVERING_TARGET_POSITION_CTYPE]
				.updateValue(position);
	  });
	};

	getService(accessory, type) {
	  return accessory.services.filter( function(value) {
	    return value.sType === type;
	  })[0];
	};

	getCharacteristic(service, characteristicType) {
	  return service.characteristics.filter(function (value) {
	    return value.cType === characteristicType;
	  })[0];
	};

}

export { RollershutterAccessoryControllerFactory };
