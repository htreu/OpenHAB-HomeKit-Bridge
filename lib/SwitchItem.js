// HomeKit types required
import Types from 'HAP-NodeJS';
var types = Types.types;

var exports = module.exports = {};
exports.item = {
  displayName: "<switchTemplate>",
  username: "1A:2B:3C:4D:5E:FF",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE,
    characteristics: [{
    	cType: types.NAME_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "<switchTemplate>",
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
  		initialValue: "SwitchItem",
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
    sType: types.SWITCH_STYPE,
    characteristics: [{
    	cType: types.NAME_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "<switchTemplate>",
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
  		manfDescription: "Turn On the Switch",
  		designedMaxLength: 1
    }]
  }]
}
