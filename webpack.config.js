const path = require('path');

module.exports = {
  entry: './src/index.js', // ваш главный JS файл
  output: {
    filename: 'main.js', // итоговый файл
    path: path.resolve(__dirname, 'dist'), // папка для сборки
  },
  mode: 'development',
  devServer: {
    contentBase: './dist',
    open: true,
  },
  module: {
    rules: [
      // при необходимости добавьте лоадеры
    ],
  },
};
