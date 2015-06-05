var switchItem = require('./SwitchItem.js').switchItem;
var WebSocket  = require('ws');
var request    = require('request');
var HAPNodeJS  = require("HAP-NodeJS");

var types                      = HAPNodeJS.types;
var accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
var service_Factor             = HAPNodeJS.serviceFactory;
var characteristic_Factor      = HAPNodeJS.characteristicFactory;

function createSwitchAccessoryController(switchWidget) {
	// deep copy the template switch item
	var switchItemTemplate = JSON.parse(JSON.stringify(switchItem));
  return publishAccessory(switchItemTemplate, switchWidget);
}

function publishAccessory(template, openHABSwitchWidget) {
  var name = openHABSwitchWidget.name;
  var url = openHABSwitchWidget.link;
  var state = openHABSwitchWidget.state;

  var informationService = getService(template, types.ACCESSORY_INFORMATION_STYPE);
  var nameCharacteristic = getNameCharacteristic(informationService);
  nameCharacteristic.initialValue = name;

  var switchService = getService(template, types.SWITCH_STYPE);
  var nameCharacteristic = getNameCharacteristic(switchService);
  nameCharacteristic.initialValue = name;

  var powerStateCharacteristic = getPowerStateCharacteristic(switchService);
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

          if (options.type === types.POWER_STATE_CTYPE) {
            updateCharacteristicsValue(url, characteristic);
          }
          service.addCharacteristic(characteristic);
      };

      accessoryController.addService(service);
  }

  return accessoryController;
}

function updateCharacteristicsValue(url, characteristic) {
  var ws = new WebSocket(url.replace('http:', 'ws:') + '/state?type=json');
  ws.on('open', function() {
    console.log('open ws connection for switch characteristic.');
  });
  ws.on('message', function(message) {
    console.log('switch received message: ' + message);
    characteristic.updateValue(message === 'ON' ? true : false);
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

module.exports = {
  createSwitchAccessoryController: createSwitchAccessoryController
}
