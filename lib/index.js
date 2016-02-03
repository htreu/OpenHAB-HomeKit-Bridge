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

 'use strict';

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
/* istanbul ignore next */
if (args.length > 0 && args[0] === 'start') {
  startOpenHABBridge();
}
