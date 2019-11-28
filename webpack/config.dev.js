'use strict';

const common = require('./config.common');

console.log('[Webpack] Use dev configuration\n');

module.exports = Object.assign({}, {
  mode: 'development',
  devtool: '#source-map',
}, common);
