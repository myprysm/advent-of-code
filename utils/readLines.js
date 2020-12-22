const readFile = require("./readFile");

const readLines = (file) =>
  readFile(file).then((content) => content.split(/\r?\n/));

module.exports = readLines;
