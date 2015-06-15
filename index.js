// enable ES6 support
require("babel/register");
// load the main file and start openHAB Bridge
require('./lib/openHABBridge.js').startOpenHABBridge();
