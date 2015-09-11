// external library imports
import stdio from 'stdio';
import crypto from 'crypto';
import storage from 'node-persist';
import HAPNodeJS from 'HAP-NodeJS';

// internal library imports
import { RestClient } from './RestClient.js';
import { ItemProvider } from './ItemProvider.js';

import { AccessoryControllerFactory } from './AccessoryControllerFactory.js';
import { DimmerItem } from './DimmerItem.js';
import { ColorItem } from './ColorItem.js';
import { SwitchItem } from './SwitchItem.js';
import { RollershutterItem } from './RollershutterItem.js';

var bridgeName = 'OpenHAB HomeKit Bridge';
var targetPort = 52826;
var pincode = "031-45-154";

// OpenHAB bridge entry point
export function startOpenHABBridge() {
  console.log("OpenHAB Bridge starting...");

  // check command line options
  let ops = stdio.getopt({
      'server' : {key: 's', args: 1, description: 'The network address and port of the OpenHAB server. Defaults to 127.0.0.1:8080.'},
      'pincode': {key: 'p', args: 1, description: 'The pincode used for the bridge accessory. Defaults to 031-45-154.'},
      'sitemap': {key: 'm', args: 1, description: 'The name of the sitemap to load all items from. Defaults to "homekit".'}
  });

  pincode = ops['pincode'] ? ops['pincode'] : pincode;
  let serverAddress = ops['server'] ? ops['server'] : "127.0.0.1:8080";
  let sitemapName = ops['sitemap'] ? ops['sitemap'] : "homekit";

  storage.initSync();

  new RestClient().fetchSitemap(serverAddress, sitemapName, function (sitemap) {
    var items = new ItemProvider().parseSitemap(sitemap);
    publishOpenHABBridgeAccessory(items);
  })
};

// iterate all items and create HAP compatible objects
function publishOpenHABBridgeAccessory(openHABWidgets) {
  let openHabBridge = new HAPNodeJS.Bridge(bridgeName, HAPNodeJS.uuid.generate(bridgeName));

  for (var i = 0; i < openHABWidgets.length; i++) {
    let openHABWidget = openHABWidgets[i];
    console.log("processing widget: "
      + openHABWidget.type
      + " " + openHABWidget.name);

    let itemProvider = new ItemProvider();
    let accessory = undefined;
    if (openHABWidget.type === itemProvider.SWITCH_ITEM) {
      accessory = new SwitchItem(
        openHABWidget.name, openHABWidget.link, openHABWidget.state).accessory;
    }
    if (openHABWidget.type === itemProvider.DIMMER_ITEM) {
      accessory = new DimmerItem(
        openHABWidget.name, openHABWidget.link, openHABWidget.state).accessory;
    }
    if (openHABWidget.type === itemProvider.COLOR_ITEM) {
      accessory = new ColorItem(
        openHABWidget.name, openHABWidget.link, openHABWidget.state).accessory;
    }
    // if (openHABWidget.type === itemProvider.ROLLERSHUTTER_ITEM) {
    //   accessory = new RollershutterItem(openHABWidget.name, openHABWidget.link, openHABWidget.state);
    // }

    if (accessory) {
      openHabBridge.addBridgedAccessory(accessory);
    }
  }

  // Publish the Bridge on the local network.
  openHabBridge.publish({
    username: generateUniqueUsername(bridgeName),
    port: parseInt(targetPort),
    pincode: pincode,
    category: HAPNodeJS.Accessory.Categories.OTHER
  });
};

function generateUniqueUsername(name) {
  let shasum = crypto.createHash('sha1')
  shasum.update(name);
  let hash = shasum.digest('hex');

  return "" +
    hash[0] + hash[1] + ':' +
    hash[2] + hash[3] + ':' +
    hash[4] + hash[5] + ':' +
    hash[6] + hash[7] + ':' +
    hash[8] + hash[9] + ':' +
    hash[10] + hash[11];
};
