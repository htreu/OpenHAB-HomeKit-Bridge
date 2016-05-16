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

// load the main file and start openHAB Bridge
import { OpenHABBridge }                          from './openHABBridge.js';

import { Colorpicker }                            from './Colorpicker.js';
import { Slider }                                 from './Slider.js';
import { Switch }                                 from './Switch.js';
import { Text }                                   from './Text.js';
                                                  
import { AccessoryProvider }                      from './AccessoryProvider.js';
import { ElementType }                            from './ElementType.js';
import { RestClient }                             from './RestClient.js';
import { SitemapParser }                          from './SitemapParser.js';
import { CustomServices, CustomCharacteristics }  from './CustomHomeKitTypes.js';

module.exports = {
  Colorpicker,
  Slider,
  Switch,
  Text,
  AccessoryProvider,
  ElementType,
  RestClient,
  SitemapParser,
  CustomServices,
  CustomCharacteristics
}

/* istanbul ignore next */
let args = process.argv.slice(2);
/* istanbul ignore next */
if (args.length > 0 && args[0] === 'start') {
  OpenHABBridge.getInstance();
}
