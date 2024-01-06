const path = require('path');

module.exports = {
  entry: './src/app.js', // Adjust the entry point based on your project structure
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    fallback: {
      fs: false, // or require.resolve('path-browserify')
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      

    },
  },
};
