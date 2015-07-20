import switchItem from './SwitchItem.js';
import WebSocket from 'ws';
import request from 'request';
import HAPNodeJS from 'HAP-NodeJS';

class SwitchAccessoryControllerFactory {
	constructor() {
		this.types                      = HAPNodeJS.types;
		this.accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
		this.service_Factor             = HAPNodeJS.serviceFactory;
		this.characteristic_Factor      = HAPNodeJS.characteristicFactory;
	}

	createSwitchAccessoryController(switchWidget) {
		// deep copy the template switch item
		var switchItemTemplate = JSON.parse(JSON.stringify(switchItem.item));
	  return this.publishAccessory(switchItemTemplate, switchWidget);
	}

	publishAccessory(template, openHABSwitchWidget) {
	  var name = openHABSwitchWidget.name;
	  var url = openHABSwitchWidget.link;
	  var state = openHABSwitchWidget.state;

	  var informationService = this.getService(template, this.types.ACCESSORY_INFORMATION_STYPE);
	  var nameCharacteristic = this.getCharacteristic(informationService, this.types.NAME_CTYPE);
	  nameCharacteristic.initialValue = name;

	  var switchService = this.getService(template, this.types.SWITCH_STYPE);
	  var nameCharacteristic = this.getCharacteristic(switchService, this.types.NAME_CTYPE);
	  nameCharacteristic.initialValue = name;

	  var powerStateCharacteristic = this.getCharacteristic(switchService, this.types.POWER_STATE_CTYPE);
	  powerStateCharacteristic.initialValue = state === 'ON' ? true : false;
	  powerStateCharacteristic.onUpdate = function (value) {
	    var command = value ? 'ON' : 'OFF';
	    request.post(
	        url,
	        { body: command },
	        function (error, response, body) {
	            if (!error && response.statusCode == 200) {
	                console.log(body)
	            }
	        }
	    );
	  };

		powerStateCharacteristic.onRead = function (callback) {
	    this.readOpenHabPowerState(url, callback);
		};

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

	          if (options.type === this.types.POWER_STATE_CTYPE) {
	            this.updateCharacteristicsValue(url, characteristic);
	          }
	          service.addCharacteristic(characteristic);
	      };

	      accessoryController.addService(service);
	  }

	  return accessoryController;
	}

	updateCharacteristicsValue(url, characteristic) {
	  var ws = new WebSocket(url.replace('http:', 'ws:') + '/state?type=json');
	  ws.on('open', function() {
	    console.log('open ws connection for switch characteristic.');
	  });
	  ws.on('message', function(message) {
	    console.log('switch received message: ' + message);
	    characteristic.updateValue(message === 'ON' ? true : false);
	  });
	};

	readOpenHabPowerState(url, callback) {
		request(url + '/state?type=json', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    callback(body === "ON" ? true : false);
		  }
		})
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

export { SwitchAccessoryControllerFactory };
