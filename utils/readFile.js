const fs = require("fs").promises;

const readFile = (file) => fs.readFile(file, "utf-8");

module.exports = readFile;
