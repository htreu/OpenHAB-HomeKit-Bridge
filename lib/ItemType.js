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

import { DimmerItem }        from './DimmerItem';
import { ColorItem }         from './ColorItem';
import { SwitchItem }        from './SwitchItem';
import { RollershutterItem } from './RollershutterItem';
import { TemperatureSensor } from './TemperatureSensor';
import { ContactSensor }     from './ContactSensor';


class ItemType {
  constructor(foo) {
    this.SWITCH_ITEM        = 'SwitchItem';
    this.DIMMER_ITEM        = 'DimmerItem';
    this.COLOR_ITEM         = 'ColorItem';
    this.ROLLERSHUTTER_ITEM = 'RollershutterItem';
    this.TEMPERATURE_SENSOR = 'NumberItem';
    this.CONTACT_SENSOR     = 'ContactItem';

    this.itemFactory = {};
    this.itemFactory[this.SWITCH_ITEM]        = SwitchItem;
    this.itemFactory[this.DIMMER_ITEM]        = DimmerItem;
    this.itemFactory[this.COLOR_ITEM]         = ColorItem;
    this.itemFactory[this.ROLLERSHUTTER_ITEM] = RollershutterItem;
    this.itemFactory[this.TEMPERATURE_SENSOR] = TemperatureSensor;
    this.itemFactory[this.CONTACT_ITEM]       = ContactSensor;
  };
}

module.exports = { ItemType };
