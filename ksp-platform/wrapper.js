const path = require('path');
const origJoin = path.join;
path.join = function(...args) {
  if (args.includes(undefined)) {
    console.error('PATH.JOIN WITH UNDEFINED!', args);
    console.error(new Error().stack);
  }
  return origJoin.apply(this, args);
};
require('C:/Users/ACER/AppData/Roaming/npm/node_modules/zcatalyst-cli/lib/bin/catalyst.js');
