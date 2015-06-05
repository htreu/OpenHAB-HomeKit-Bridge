var stdio     = require('stdio');
var crypto    = require('crypto');
var storage   = require('node-persist');
var HAPNodeJS = require("HAP-NodeJS");

var SwitchAccessoryControllerFactory = require('./lib/SwitchAccessoryControllerFactory.js');
var DimmerAccessoryControllerFactory = require('./lib/DimmerAccessoryControllerFactory.js');
var RestClient = require('./lib/RestClient.js');
var ItemProvider = require('./lib/ItemProvider.js');

// check command line options
var ops = stdio.getopt({
    'server' : {key: 's', args: 1, description: 'The network address and port of the OpenHAB server. Defaults to 127.0.0.1:8080.'},
    'pincode': {key: 'p', args: 1, description: 'The pincode used for the bridge accessory. Defaults to 031-45-154.'},
    'sitemap': {key: 'm', args: 1, description: 'The name of the sitemap to load all items from. Defaults to "homekit".'}
});

var accessory_Factor = HAPNodeJS.accessoryFactory;
var bridge_Factor    = HAPNodeJS.bridgeFactory;

console.log("OpenHAB Bridge starting...");
storage.initSync();

var targetPort = 52826;
var bridgeName = "OpenHAB HomeKit Bridge";
var pincode = ops['pincode'] ? ops['pincode'] :"031-45-154";
var serverAddress = ops['server'] ? ops['server'] : "127.0.0.1:8080";
var sitemapName = ops['sitemap'] ? ops['sitemap'] : "homekit";

// start the OpenHAB bridge
(function startOpenHABBridge() {
  RestClient.fetchSitemap(serverAddress, sitemapName, function (sitemap) {
    var items = ItemProvider.parseSitemap(sitemap);
    publishOpenHABBridgeAccessory(items);
  })
})();

// iterate all items and create HAP compatible objects
function publishOpenHABBridgeAccessory(openHABWidgets) {
  var bridgeController = new bridge_Factor.BridgedAccessoryController();
  for (var i = 0; i < openHABWidgets.length; i++) {
    var accessoryController = undefined;
    var openHABWidget = openHABWidgets[i];
    if (openHABWidget.type === 'Switch') {
      accessoryController = SwitchAccessoryControllerFactory
        .createSwitchAccessoryController(openHABWidget);
    }
    if (openHABWidget.type === 'Slider') {
      accessoryController = DimmerAccessoryControllerFactory
        .createDimmerAccessoryController(openHABWidget);
    }

    if (accessoryController) {
      bridgeController.addAccessory(accessoryController);
    }
  }

  var accessory = new accessory_Factor.Accessory(
    bridgeName,
    generateUniqueUsername(bridgeName),
    storage,
    parseInt(targetPort),
    pincode,
    bridgeController);
  accessory.publishAccessory();
};

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
};
