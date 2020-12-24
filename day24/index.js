const readLines = require("../utils/readLines");

const directions = ["e", "se", "sw", "w", "nw", "ne"];
const vectors = [
  [2, 0],
  [1, -1],
  [-1, -1],
  [-2, 0],
  [-1, 1],
  [1, 1],
];
const readPosition = (coordinates) =>
  coordinates.split(",").map((c) => parseInt(c));
const writePosition = (position) => position.join(",");
const getMovement = (direction) => vectors[directions.indexOf(direction)];

const move = ({ position: [x, y], direction }) => {
  const [x1, y1] = getMovement(direction);
  return [x + x1, y + y1];
};

const readChange = (rawChanges) => {
  let changes = [];
  let currentChange = "";
  for (let i = 0, max = rawChanges.length; i < max; i++) {
    const char = rawChanges.charAt(i);
    if (char === "s" || char === "n") {
      currentChange = char;
      continue;
    }

    currentChange += char;
    changes.push(currentChange);
    currentChange = "";
  }

  return changes;
};

const readChanges = (changeList) =>
  changeList.filter((l) => l.length).map(readChange);

const flipTiles = (changes) => {
  let blackTiles = new Set();

  for (const change of changes) {
    const currentPosition = change.reduce(
      (position, direction) => move({ position, direction }),
      [0, 0]
    );
    const currentPositionKey = writePosition(currentPosition);

    if (blackTiles.has(currentPositionKey)) {
      blackTiles.delete(currentPositionKey);
    } else {
      blackTiles.add(currentPositionKey);
    }
  }
  return blackTiles;
};

const countBlackTiles = (tiles) => tiles.size;

const getNeighbors = (position) =>
  directions.map((direction) => move({ position, direction }));

const getNeighborCoordinates = (coordinates) =>
  getNeighbors(readPosition(coordinates)).map(writePosition);

const playRound = (tiles) => {
  const counts = new Map();

  for (const tile of tiles) {
    for (const neighbor of getNeighborCoordinates(tile)) {
      counts.set(neighbor, (counts.get(neighbor) || 0) + 1);
    }
  }

  const newTiles = new Set();
  for (const [tile, count] of counts) {
    if ((tiles.has(tile) && count === 1) || count === 2) {
      newTiles.add(tile);
    }
  }

  return newTiles;
};

const playGame = ({ tiles, rounds }) => {
  let gameTiles = new Set(tiles);

  for (let i = 1; i <= rounds; i++) {
    gameTiles = playRound(gameTiles);
    console.log(`Round ${i}, blackTiles: ${countBlackTiles(gameTiles)}`);
  }

  return gameTiles;
};

const part1 = (changeList) => {
  const tiles = flipTiles(changeList);
  const blackTiles = countBlackTiles(tiles);

  console.log({ blackTiles });
};

const part2 = (changeList) => {
  const initialTiles = flipTiles(changeList);
  const tiles = playGame({ tiles: initialTiles, rounds: 100 });
  const blackTiles = countBlackTiles(tiles);

  console.log({ blackTiles });
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const rawChangelist = await readLines(input);
  const changeList = readChanges(rawChangelist);

  part1(changeList);
  part2(changeList);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
