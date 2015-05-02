var stdio = require('stdio');

// check command line options
var ops = stdio.getopt({
    'server' : {key: 's', args: 1, description: 'The network address and port of the OpenHAB server. Defaults to 127.0.0.1:8080.'},
    'pincode': {key: 'p', args: 1, description: 'The pincode used for the bridge accessory. Defaults to 031-45-154.'},
    'sitemap': {key: 'm', args: 1, description: 'The name of the sitemap to load all items from. Defaults to "homekit".'}
});

var request    = require('request');
var crypto     = require('crypto');
var WebSocket  = require('ws')
var storage    = require('node-persist');
var HAPNodeJS  = require("HAP-NodeJS");
var switchItem = require("./switchItem.js").switchItem;

var types                      = HAPNodeJS.types;
var accessory_Factor           = HAPNodeJS.accessoryFactory;
var accessoryController_Factor = HAPNodeJS.accessoryControllerFactory;
var service_Factor             = HAPNodeJS.serviceFactory;
var characteristic_Factor      = HAPNodeJS.characteristicFactory;
var bridge_Factor              = HAPNodeJS.bridgeFactory;

console.log("OpenHAB Bridge starting...");
storage.initSync();

var bridgeController = new bridge_Factor.BridgedAccessoryController();
var targetPort = 52826;
var bridgeName = "OpenHAB HomeKit Bridge";
var pincode = ops['pincode'] ? ops['pincode'] :"031-45-154";
var serverAddress = ops['server'] ? ops['server'] : "127.0.0.1:8080";
var sitemapName = ops['sitemap'] ? ops['sitemap'] : "homekit";

registerOpenHABAccessories();


function registerOpenHABAccessories() {
  require('./RestClient.js').fetchSitemap(serverAddress, sitemapName, function (sitemap) {
    var items = require('./ItemProvider.js').parseSitemap(sitemap, 'Switch');
    publishOpenHABBridgeAccessory(items);
  })
}

// iterate all items and create HAP compatible objects
function publishOpenHABBridgeAccessory(openHABWidgets) {
  for (var i = 0; i < openHABWidgets.length; i++) {
    var openHABWidget = openHABWidgets[i];
    var switchItemTemplate = JSON.parse(JSON.stringify(switchItem));
    var accessoryController = publishAccessory(switchItemTemplate, openHABWidget);
    bridgeController.addAccessory(accessoryController);
  }

  var accessory = new accessory_Factor.Accessory(
    bridgeName,
    generateUniqueUsername(bridgeName),
    storage,
    parseInt(targetPort),
    pincode,
    bridgeController);
  accessory.publishAccessory();
}

function getService(accessory, type) {
  return accessory.services.filter( function(value) {
    return value.sType === type;
  })[0];
}

function getNameCharacteristic(service) {
  return service.characteristics.filter(function (value) {
    return value.cType === types.NAME_CTYPE;
  })[0];
}

function getPowerStateCharacteristic(service) {
  return service.characteristics.filter(function (value) {
    return value.cType === types.POWER_STATE_CTYPE;
  })[0];
}

function generateUniqueUsername(name) {
  var shasum = crypto.createHash('sha1')
  shasum.update(name);
  var hash = shasum.digest('hex');

  return "" +
    hash[0] + hash[1] + ':' +
    hash[2] + hash[3] + ':' +
    hash[4] + hash[5] + ':' +
    hash[6] + hash[7] + ':' +
    hash[8] + hash[9] + ':' +
    hash[10] + hash[11];
}

function publishAccessory(template, openHABSwitchWidget) {
  var name = openHABSwitchWidget.name;
  var url = openHABSwitchWidget.link;
  var state = openHABSwitchWidget.state;

  var informationService = getService(template, types.ACCESSORY_INFORMATION_STYPE);
  var nameCharacteristic = getNameCharacteristic(informationService);
  nameCharacteristic.initialValue = name;

  var lightBulbService = getService(template, types.LIGHTBULB_STYPE);
  var nameCharacteristic = getNameCharacteristic(lightBulbService);
  nameCharacteristic.initialValue = name;

  var powerStateCharacteristic = getPowerStateCharacteristic(lightBulbService);
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
    console.log('message: ' + message);
    characteristic.updateValue(message === 'ON' ? true : false);
  });
};
