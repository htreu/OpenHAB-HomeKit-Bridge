'use strict';

class ItemType {
  constructor() {
    this.SWITCH_ITEM = 'SwitchItem';
    this.DIMMER_ITEM = 'DimmerItem';
    this.COLOR_ITEM = 'ColorItem';
    this.ROLLERSHUTTER_ITEM = 'RollershutterItem';
    this.NUMBER_ITEM = 'NumberItem';
    this.CONTACT_ITEM = 'ContactItem';
    this.GROUP_ITEM = 'GroupItem';
  };

  foo() {
    console.log('foo');
  }
}

//module.exports = { ItemType };
export { ItemType };