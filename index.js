// enable es2015 support
require("babel/register");
// load the main file and start openHAB Bridge
require('./lib/openHABBridge.js').startOpenHABBridge();
