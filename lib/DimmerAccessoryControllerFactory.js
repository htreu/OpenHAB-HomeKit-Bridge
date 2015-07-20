import dimmerItem from './DimmerItem.js';
import WebSocket from 'ws';
import request from 'request';
import HAPNodeJS from 'HAP-NodeJS';

class DimmerAccessoryControllerFactory {
	constructor() {
		this.types                      = HAPNodeJS.types;
		this.accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
		this.service_Factor             = HAPNodeJS.serviceFactory;
		this.characteristic_Factor      = HAPNodeJS.characteristicFactory;
	}

	createDimmerAccessoryController(dimmerWidget) {
		// deep copy the template switch item
		var dimmerItemTemplate = JSON.parse(JSON.stringify(dimmerItem.item));
	  return this.publishAccessory(dimmerItemTemplate, dimmerWidget);
	}

	publishAccessory(template, openHABdimmerWidget) {
	  var name = openHABdimmerWidget.name;
	  var url = openHABdimmerWidget.link;
	  var state = openHABdimmerWidget.state;

	  var informationService = this.getService(template, this.types.ACCESSORY_INFORMATION_STYPE);
	  var nameCharacteristic = this.getCharacteristic(informationService, this.types.NAME_CTYPE);
	  nameCharacteristic.initialValue = name;

	  var lightbulbService = this.getService(template, this.types.LIGHTBULB_STYPE);
	  var nameCharacteristic = this.getCharacteristic(lightbulbService, this.types.NAME_CTYPE);
	  nameCharacteristic.initialValue = name;

	  var powerStateCharacteristic = this.getCharacteristic(lightbulbService, this.types.POWER_STATE_CTYPE);
	  powerStateCharacteristic.initialValue = state === 'ON' ? true : false;
	  powerStateCharacteristic.onUpdate = function (value) {
	    updateOpenHabItem(url, value);
	  };
		powerStateCharacteristic.onRead = function (callback) {
	    readOpenHabPowerState(url, callback);
	  };

		var brightnessCharacteristic = this.getCharacteristic(lightbulbService, this.types.BRIGHTNESS_CTYPE);
		brightnessCharacteristic.initialValue = +state;
		brightnessCharacteristic.onUpdate = function(value) {
			updateOpenHabItem(url, value);
		};
		brightnessCharacteristic.onRead = function(callback) {
			readOpenHabBrightnessState(url, callback);
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
								onRead: characteristicTemplate.onRead
	          }
	          var characteristic =
	            new this.characteristic_Factor.Characteristic(options, characteristicTemplate.onUpdate);

	          if (options.type === this.types.POWER_STATE_CTYPE
						    || options.type === this.types.BRIGHTNESS_CTYPE)
						{
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

	readOpenHabPowerState(url, callback) {
		request(url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    callback(+body > 0 ? true : false);
		  }
		})
	};

	readOpenHabBrightnessState(url, callback) {
		request(url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    callback(+body);
		  }
		})
	};

	updateCharacteristicsValue(url, updateCharacteristics) {
	  var ws = new WebSocket(url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for dimmer item.');
	  });
	  ws.on('message', function(message) {
			if ((+message) >= 0) {
				var brightness = +message;
				// set brightness
				updateCharacteristics[this.types.BRIGHTNESS_CTYPE]
					.updateValue(brightness);
				// update ON/OFF state
				updateCharacteristics[this.types.POWER_STATE_CTYPE]
						.updateValue(brightness > 0 ? true : false);
			}
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

export { DimmerAccessoryControllerFactory };
