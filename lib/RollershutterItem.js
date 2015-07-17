// HomeKit types required
import Types from "HAP-NodeJS";
var types = Types.types;

var exports = module.exports = {};
exports.item = {
  displayName: "<rollershutterTemplate>",
  username: "1A:2B:3C:4D:5E:FF",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE,
    characteristics: [{
    	cType: types.NAME_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "<rollershutterTemplate>",
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
  		initialValue: "RollershutterItem",
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
    sType: types.WINDOW_COVERING_STYPE,
    characteristics: [{
    	cType: types.NAME_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
  		format: "string",
  		initialValue: "<rollershutterTemplate>",
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Bla",
  		designedMaxLength: 255
    },{
    	cType: types.WINDOW_COVERING_CURRENT_POSITION_CTYPE,
    	onUpdate: null,
    	perms: ["pr","ev"],
  		format: "int",
  		initialValue: 0,
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Current window covering position",
  		designedMinValue: 0,
  		designedMaxValue: 100,
  		designedMinStep: 1,
  		unit: "%"
    },{
    	cType: types.WINDOW_COVERING_TARGET_POSITION_CTYPE,
    	onUpdate: null,
    	perms: ["pw","pr","ev"],
  		format: "int",
  		initialValue: 0,
  		supportEvents: false,
  		supportBonjour: false,
  		manfDescription: "Target window covering position",
  		designedMinValue: 0,
  		designedMaxValue: 100,
  		designedMinStep: 1,
  		unit: "%"
    },{
    	cType: types.WINDOW_COVERING_OPERATION_STATE_CTYPE,
    	onUpdate: null,
    	perms: ["pr","ev"],
  		format: "int",
  		initialValue: 0,
  		supportEvents: false,
  		supportBonjour: false,
      manfDescription: "Window covering operation state",
  		designedMinValue: 0,
  		designedMaxValue: 2,
  		designedMinStep: 1,
    }]
  }]
}
