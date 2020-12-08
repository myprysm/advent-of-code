const readLines = require("../utils/readLines");

const isValidByNumberOfOccurrences = (line) => {
  const [boundaries, letterWithColon, password] = line.split(" ");
  const letter = letterWithColon.substr(0, 1);
  const [min, max] = boundaries.split("-").map((i) => parseInt(i));

  const occurences = password.split("").filter((l) => l === letter).length;

  return min <= occurences && occurences <= max;
};

const isValidByPosition = (line) => {
  const [positions, letterWithColon, password] = line.split(" ");
  const letter = letterWithColon.substr(0, 1);
  const [pos1, pos2] = positions.split("-").map((i) => parseInt(i));

  return (
    (password[pos1 - 1] === letter && password[pos2 - 1] !== letter) ||
    (password[pos2 - 1] === letter && password[pos1 - 1] !== letter)
  );
};

async function main() {
  const passwords = await readLines(`${__dirname}/inputs.txt`);

  console.log(passwords.filter(isValidByPosition).length);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
