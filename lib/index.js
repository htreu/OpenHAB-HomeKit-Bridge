// load the main file and start openHAB Bridge
import { startOpenHABBridge } from './openHABBridge.js';

import { ColorItem } from './ColorItem';
import { DimmerItem } from './DimmerItem';
import { RollershutterItem } from './RollershutterItem';
import { SwitchItem } from './SwitchItem';
import { TemperatureSensor } from './TemperatureSensor';
import { ContactSensor } from './ContactSensor';

import { ItemProvider } from './ItemProvider';
import { ItemType } from './ItemType';
import { RestClient } from './RestClient';
import { SitemapParser } from './SitemapParser';

exports.ColorItem = ColorItem;
exports.DimmerItem = DimmerItem;
exports.RollershutterItem = RollershutterItem;
exports.SwitchItem = SwitchItem;
exports.TemperatureSensor = TemperatureSensor;
exports.ContactSensor = ContactSensor;

exports.ItemProvider = ItemProvider;
exports.ItemType = ItemType;
exports.RestClient = RestClient;
exports.SitemapParser = SitemapParser;

/* istanbul ignore next */
var args = process.argv.slice(2);
if (args.length > 0 && args[0] === 'start') {
  startOpenHABBridge();
}
