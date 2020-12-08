const readLines = require("../utils/readLines");

const getLocation = (path, min, max) => {
  const [move, ...rest] = path;
  const round = move === "+" ? Math.ceil : Math.floor;
  const halfDistance = round((max - min) / 2);
  const nextPosition = min + halfDistance;

  if (!rest.length) {
    return nextPosition;
  }

  const subMin = move === "+" ? nextPosition : min;
  const subMax = move === "+" ? max : nextPosition;
  return getLocation(rest, subMin, subMax);
};

const getSeat = ({ rows, columns }) => (boardingPass) => {
  const rowPath = boardingPass
    .substr(0, 7)
    .replace(/F/g, "-")
    .replace(/B/g, "+");
  const columnPath = boardingPass
    .substr(7)
    .replace(/L/g, "-")
    .replace(/R/g, "+");

  const row = getLocation(rowPath, 0, rows - 1);
  const column = getLocation(columnPath, 0, columns - 1);

  return [row, column];
};

const calculatePosition = ([row, column]) => row * 8 + column;

async function main() {
  const boardingPasses = await readLines(`${__dirname}/inputs.txt`);
  const rows = 128,
    columns = 8;

  const seat = boardingPasses
    .map(getSeat({ rows, columns }))
    .map(calculatePosition)
    .sort((a, b) => a - b)
    .find((seat, index, seats) => seats[index + 1] - seat > 1);

  console.log(seat + 1);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
