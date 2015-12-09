// load the main file and start openHAB Bridge
import { startOpenHABBridge } from './openHABBridge.js';

import { ColorItem }         from './ColorItem.js';
import { DimmerItem }        from './DimmerItem.js';
import { RollershutterItem } from './RollershutterItem.js';
import { SwitchItem }        from './SwitchItem.js';
import { TemperatureSensor } from './TemperatureSensor.js';
import { ContactSensor }     from './ContactSensor.js';

import { AccessoryProvider } from './AccessoryProvider.js';
import { ItemType }          from './ItemType.js';
import { RestClient }        from './RestClient.js';
import { SitemapParser }     from './SitemapParser.js';

module.exports = {
  ColorItem,
  DimmerItem,
  RollershutterItem,
  SwitchItem,
  TemperatureSensor,
  ContactSensor,
  AccessoryProvider,
  ItemType,
  RestClient,
  SitemapParser
}

/* istanbul ignore next */
var args = process.argv.slice(2);
if (args.length > 0 && args[0] === 'start') {
  startOpenHABBridge();
}
