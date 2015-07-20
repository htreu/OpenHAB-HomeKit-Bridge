// HomeKit types required
import Types from 'HAP-NodeJS';
var types = Types.types;

var exports = module.exports = {};
exports.item = {
  displayName: "<colorTemplate>",
  username: "1A:2B:3C:4D:5E:FF",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE,
    characteristics: [{
    	cType: types.NAME_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
		format: "string",
		initialValue: "<colorTemplate>",
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
		initialValue: "colorItem",
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
		initialValue: "Lightbulb Service",
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
		manfDescription: "Turn On the Light",
		designedMaxLength: 1
    },{
    	cType: types.HUE_CTYPE,
    	onUpdate: function(value) { console.log("Change:",value); execute("Test Accessory 1", "Light - Hue", value); },
    	perms: ["pw","pr","ev"],
		format: "int",
		initialValue: 0,
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Adjust Hue of Light",
		designedMinValue: 0,
		designedMaxValue: 360,
		designedMinStep: 1,
		unit: "arcdegrees"
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
    },{
    	cType: types.SATURATION_CTYPE,
    	onUpdate: function(value) { console.log("Change:",value); execute("Test Accessory 1", "Light - Saturation", value); },
    	perms: ["pw","pr","ev"],
		format: "int",
		initialValue: 0,
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Adjust Saturation of Light",
		designedMinValue: 0,
		designedMaxValue: 100,
		designedMinStep: 1,
		unit: "%"
    }]
  }]
}
