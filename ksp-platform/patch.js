const path = require('path');
const origJoin = path.join;
path.join = function(...args) {
  if (args.includes(undefined)) {
    console.error('UNDEFINED_PATH_ERROR', args);
    console.error(new Error().stack);
  }
  return origJoin.apply(this, args);
};
require('C:/Users/ACER/AppData/Roaming/npm/node_modules/zcatalyst-cli/lib/bin/catalyst.js');
