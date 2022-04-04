// remove this file when electron upgrades to ES Modules (should be after node hits version 14)
// for details, see: https://github.com/electron/electron/issues/21457

require = require('esm')(module);
module.exports = require('./index.js');