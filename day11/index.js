const readLines = require("../utils/readLines");

const areEqual = (seatsA, seatsB) => {
  for (let i = 0, iMax = seatsA.length; i < iMax; i++) {
    for (let j = 0, jMax = seatsA[i].length; j < jMax; j++) {
      if (seatsA[i][j] !== seatsB[i][j]) {
        return false;
      }
    }
  }

  return true;
};

const isValidPosition = ({ x, y, i, j, height, width }) =>
  i >= 0 && i < height && j >= 0 && j < width && (i !== x || j !== y);

const numberOfOccupiedAdjacentSeats = ({ seats, x, y }) => {
  let occupiedSeats = 0;
  const height = seats.length;
  const width = seats[0].length;

  for (let i = x - 1, iMax = x + 2; i < iMax; i++) {
    for (let j = y - 1, jMax = y + 2; j < jMax; j++) {
      const isValid = isValidPosition({ x, y, i, j, height, width });

      if (isValid && seats[i][j] === "#") {
        occupiedSeats++;
      }
    }
  }

  return occupiedSeats;
};

const directionVectors = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

const findClosestSeatInDirection = ({ seats, x, y, i, j, height, width }) => {
  const xPrime = x + i;
  const yPrime = y + j;
  const isValid = isValidPosition({
    seats,
    x,
    y,
    i: xPrime,
    j: yPrime,
    height,
    width,
  });

  if (!isValid) {
    return ".";
  }

  return seats[xPrime][yPrime] !== "."
    ? seats[xPrime][yPrime]
    : findClosestSeatInDirection({
        seats,
        x: xPrime,
        y: yPrime,
        i,
        j,
        height,
        width,
      });
};

const numberOfOccupiedVisibleSeats = ({ seats, x, y }) => {
  const height = seats.length;
  const width = seats[0].length;

  const visibleSeats = directionVectors.map(([i, j]) =>
    findClosestSeatInDirection({ seats, x, y, i, j, height, width })
  );

  return visibleSeats.filter((s) => s === "#").length;
};
const playUntilNoOneMoves = (seats) => {
  const seatsAfterTurn = [];

  for (let x = 0, xMax = seats.length; x < xMax; x++) {
    const row = [];
    for (let y = 0, yMax = seats[x].length; y < yMax; y++) {
      const cell = seats[x][y];

      // Ground
      if (cell === ".") {
        row.push(cell);
        continue;
      }

      // Empty seat
      if (cell === "L") {
        // const occupiedSeats = numberOfOccupiedAdjacentSeats({ seats, x, y });
        const occupiedSeats = numberOfOccupiedVisibleSeats({ seats, x, y });
        const newCell = occupiedSeats === 0 ? "#" : "L";
        row.push(newCell);
        continue;
      }

      // Occupied seat
      if (cell === "#") {
        // const occupiedSeats = numberOfOccupiedAdjacentSeats({ seats, x, y });
        const occupiedSeats = numberOfOccupiedVisibleSeats({ seats, x, y });

        // const newCell = occupiedSeats > 3 ? "L" : "#";
        const newCell = occupiedSeats > 4 ? "L" : "#";

        row.push(newCell);
      }
    }

    seatsAfterTurn.push(row);
  }

  return areEqual(seats, seatsAfterTurn)
    ? seats
    : playUntilNoOneMoves(seatsAfterTurn);
};

async function main() {
  const initialSeats = (await readLines(`${__dirname}/inputs.txt`)).map((row) =>
    row.split("")
  );

  const seatsAfterPrediction = playUntilNoOneMoves(initialSeats);

  const occupiedSeats = seatsAfterPrediction.flat().filter((s) => s === "#")
    .length;

  console.log({ occupiedSeats });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
