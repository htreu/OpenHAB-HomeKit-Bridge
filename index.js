// enable es2015 support
require("babel/register");
module.exports = require(process.env.COVER ? './lib-cov' : './lib');
