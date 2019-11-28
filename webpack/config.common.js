'use strict';

const path = require('path');

module.exports = {

  entry: {
    main: path.resolve('./src/index.js')
  },
  
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('./public/dist')
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
