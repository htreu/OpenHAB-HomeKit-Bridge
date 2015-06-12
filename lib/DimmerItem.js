// HomeKit types required
var types = require("HAP-NodeJS").types;
var exports = module.exports = {};

var execute = function(accessory,characteristic,value) {
  console.log("executed accessory: " + accessory + ", and characteristic: "
    + characteristic + ", with value: " +  value + ".");
}

exports.dimmerItem = {
  displayName: "<dimmerTemplate>",
  username: "1A:2B:3C:4D:5E:FF",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE,
    characteristics: [{
    	cType: types.NAME_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "<dimmerTemplate>",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
    },{
    	cType: types.MANUFACTURER_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "openHAB",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
    },{
    	cType: types.MODEL_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "dimmerItem",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
    },{
    	cType: types.SERIAL_NUMBER_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "<sn>",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
    },{
    	cType: types.IDENTIFY_CTYPE,
    	onUpdate: null,
    	perms: ["pw"],
  		format: "bool",
  		initialValue: false,
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Identify Accessory",
  		designedMaxLength: 1
    }]
  },{
    sType: types.LIGHTBULB_STYPE,
    characteristics: [{
    	cType: types.NAME_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "<dimmerTemplate>",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
    },{
    	cType: types.POWER_STATE_CTYPE,
    	onUpdate: function(value) { console.log("Change:",value); execute("Test Accessory 1", "light service", value); },
    	perms: ["pw","pr","ev"],
  		format: "bool",
  		initialValue: false,
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Turn On the Dimmer",
  		designedMaxLength: 1
    },{
    	cType: types.BRIGHTNESS_CTYPE,
    	onUpdate: function(value) { console.log("Change:",value); execute("Test Accessory 1", "Light - Brightness", value); },
    	perms: ["pw","pr","ev"],
  		format: "int",
  		initialValue: 0,
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Adjust Brightness of Light",
  		designedMinValue: 0,
  		designedMaxValue: 100,
  		designedMinStep: 1,
  		unit: "%"
    }]
  }]
}
