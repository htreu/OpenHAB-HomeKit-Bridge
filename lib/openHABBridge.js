'use strict';
// external library imports
import stdio from 'stdio';
import crypto from 'crypto';
import storage from 'node-persist';
import { Accessory, Bridge, uuid } from 'hap-nodejs';

// internal library imports
import { UpdateListener } from './UpdateListener.js';
import { RestClient } from './RestClient.js';
import { SitemapParser } from './SitemapParser.js';
import { ItemProvider } from './ItemProvider.js';

var bridgeName = 'OpenHAB HomeKit Bridge';
var targetPort = 52826;
var pincode = "031-45-154";

// OpenHAB bridge entry point
/* istanbul ignore next */
export function startOpenHABBridge() {
  console.log("OpenHAB Bridge starting...");

  // check command line options
  let ops = stdio.getopt({
      'server' : {key: 's', args: 1, description: 'The network address and port of the OpenHAB server. Defaults to 127.0.0.1:8080.'},
      'pincode': {key: 'p', args: 1, description: 'The pincode used for the bridge accessory. Defaults to 031-45-154.'},
      'sitemap': {key: 'm', args: 1, description: 'The name of the sitemap to load all items from. Defaults to "homekit".'},
      'version': {key: 'v', args: 1, description: 'Version of OpenHab, 1 or 2. Defaults to 1.'}
  });

  pincode = ops['pincode'] ? ops['pincode'] : pincode;
  let serverAddress = ops['server'] ? ops['server'] : "127.0.0.1:8080";
  let sitemapName = ops['sitemap'] ? ops['sitemap'] : "homekit";
  let ohVersion = ops['version'] ? ops['version'] : "1";

  storage.initSync();

  new RestClient().fetchSitemap(serverAddress, sitemapName, function (sitemap) {
    var items = new SitemapParser().parseSitemap(sitemap);
    publishOpenHABBridgeAccessory(items, ohVersion);
  })

  if (ohVersion == 2) {
    UpdateListener.startSseListener("http://" + serverAddress + "/rest/events");
  }
};

// iterate all items and create HAP compatible objects
/* istanbul ignore next */
function publishOpenHABBridgeAccessory(openHABWidgets, ohVersion) {
  let itemProvider = new ItemProvider(ohVersion);
  let homeKitAccessories = itemProvider.createHomeKitAccessories(openHABWidgets);
  let openHabBridge = new Bridge(bridgeName, uuid.generate(bridgeName));

  homeKitAccessories.forEach(function(accessory) {
    openHabBridge.addBridgedAccessory(accessory);
  });

  // Publish the Bridge on the local network.
  openHabBridge.publish({
    username: generateUniqueUsername(bridgeName),
    port: parseInt(targetPort),
    pincode: pincode,
    category: Accessory.Categories.OTHER
  });
};

/* istanbul ignore next */
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
