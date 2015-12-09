'use strict';

import { DimmerItem }        from './DimmerItem';
import { ColorItem }         from './ColorItem';
import { SwitchItem }        from './SwitchItem';
import { RollershutterItem } from './RollershutterItem';
import { TemperatureSensor } from './TemperatureSensor';
import { ContactSensor }     from './ContactSensor';


class ItemType {
  constructor() {
    this.SWITCH_ITEM        = 'SwitchItem';
    this.DIMMER_ITEM        = 'DimmerItem';
    this.COLOR_ITEM         = 'ColorItem';
    this.ROLLERSHUTTER_ITEM = 'RollershutterItem';
    this.TEMPERATURE_SENSOR = 'NumberItem';
    this.CONTACT_SENSOR     = 'ContactItem';
    this.GROUP_ITEM         = 'GroupItem';

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
