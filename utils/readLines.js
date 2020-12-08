const fs = require("fs").promises;

/**
 * Read all the lines in the file as strings.
 * @param file the file to read
 * @returns {Promise<string[]>} the lines
 */
const readLines = (file) =>
  fs.readFile(file, "utf-8").then((content) => content.split(/\r?\n/));

module.exports = readLines;
