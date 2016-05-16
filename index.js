'use strict';

// enable es2015 support
require("babel-core/register");

var lib_dir = 'lib'; // default classes

if (process.env.TEST) {
  lib_dir = 'lib-test'; // precompiled for tests
}
if (process.env.COVER) {
  lib_dir = 'lib-cov'; // compiled and instrumented for coverage
}

module.exports = require('./' + lib_dir);
