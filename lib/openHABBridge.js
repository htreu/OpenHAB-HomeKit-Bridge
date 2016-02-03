/**
 * Copyright 2016 Henning Treu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// external library imports
import stdio from 'stdio';
import crypto from 'crypto';
import { Accessory, Bridge, uuid, init } from 'hap-nodejs';

// internal library imports
import { RestClient } from './RestClient.js';
import { SitemapParser } from './SitemapParser.js';
import { AccessoryProvider } from './AccessoryProvider.js';

let targetPort = 52826;
let pincode = '031-45-154';

// OpenHAB bridge entry point
/* istanbul ignore next */
export function startOpenHABBridge() {
  // check command line options
  let ops = stdio.getopt({
      'name'   : {key: 'n', args: 1, description:
        'The name of the bridge.', mandatory: true},
      'server' : {key: 's', args: 1, description:
        'The network address and port of the OpenHAB server. Defaults to 127.0.0.1:8080.'},
      'pincode': {key: 'p', args: 1, description:
        'The pincode used for the bridge accessory. Defaults to 031-45-154.'},
      'sitemap': {key: 'm', args: 1, description:
        'The name of the sitemap to load all items from. Defaults to "homekit".'}
  });

  pincode = ops['pincode'] ? ops['pincode'] : pincode;
  let serverAddress = ops['server'] ? ops['server'] : '127.0.0.1:8080';
  let sitemapName = ops['sitemap'] ? ops['sitemap'] : 'homekit';
  let name = ops['name'];

  console.log('Starting the bridge ' + name + ' ...');

  // initialize the hap-nodejs storage
  init();

  new RestClient().fetchSitemap(serverAddress, sitemapName, function (sitemap) {
    let items = new SitemapParser().parseSitemap(sitemap);
    publishOpenHABBridgeAccessory(name, items);
  })
};

// iterate all items and create HAP compatible objects
/* istanbul ignore next */
function publishOpenHABBridgeAccessory(bridgeName, openHABWidgets) {
  let accessoryProvider = new AccessoryProvider();
  let homeKitAccessories = accessoryProvider.createHomeKitAccessories(openHABWidgets);
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

  return '' +
    hash[0] + hash[1] + ':' +
    hash[2] + hash[3] + ':' +
    hash[4] + hash[5] + ':' +
    hash[6] + hash[7] + ':' +
    hash[8] + hash[9] + ':' +
    hash[10] + hash[11];
};
