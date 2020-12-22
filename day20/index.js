const readFile = require("../utils/readFile");
const arrayEquals = require("../utils/arrayEquals");

const sides = ["top", "right", "bottom", "left"];

const getSide = (side) => sides[side];
const getDirection = (side) => (side % 2 === 1 ? "horizontal" : "vertical");
const toChar = (value) => (value ? "#" : ".");

const getRotation = ({ from, to }) => {
  if (from === to) {
    return 0;
  }

  const rotation = from - to;

  if (rotation > 0) {
    return 4 - rotation;
  }

  return Math.abs(rotation);
};

const reverse = (array) => {
  const newArray = [];

  if (array) {
    for (let i = array.length - 1; i >= 0; i--) {
      newArray.push(array[i]);
    }
  }

  return newArray;
};

const rotateMatrix90 = (matrix) =>
  matrix.map((row, i) =>
    row.map((cell, j) => matrix[matrix.length - 1 - j][i])
  );

const rotateMatrix270 = (matrix) =>
  matrix.map((row, i) =>
    row.map((cell, j) => matrix[j][matrix.length - 1 - i])
  );

const rotateMatrix180 = (matrix) =>
  matrix.map((row, i) =>
    row.map((cell, j) => matrix[matrix.length - 1 - i][matrix.length - 1 - j])
  );

const rotateTile = (tile, times = 1) => {
  let matrix = tile.matrix;

  let rotation = times % 4;
  switch (rotation) {
    case 1:
      matrix = rotateMatrix90(matrix);
      break;
    case 2:
      matrix = rotateMatrix180(matrix);
      break;
    case 3:
      matrix = rotateMatrix270(matrix);
      break;
  }

  if (rotation) {
    setMatrix(tile, matrix);
  }
};

const setMatrix = (tile, matrix) => {
  const sides = getSides(matrix);
  tile.matrix = matrix;
  tile.top = sides.top;
  tile.right = sides.right;
  tile.bottom = sides.bottom;
  tile.left = sides.left;
};

const flipMatrix = (matrix, direction = "horizontal") =>
  direction === "horizontal"
    ? matrix.map((row) => reverse(row))
    : reverse(matrix);

const flipTile = (tile, direction = "horizontal") => {
  const flippedMatrix = flipMatrix(tile.matrix, direction);
  setMatrix(tile, flippedMatrix);
};

const getSides = (matrix) => ({
  top: matrix[0],
  bottom: matrix[matrix.length - 1],
  left: matrix.map((row) => row[0]),
  right: matrix.map((row) => row[row.length - 1]),
});

const readTiles = (rawTiles) =>
  rawTiles
    .split(/\n{2}/)
    .filter((t) => t.length)
    .map((t) => t.split(/\n/).filter((l) => l.length))
    .map(([header, ...lines]) => [
      header.replace("Tile ", "").replace(":", ""),
      lines.map((line) => line.split("").map((c) => c === "#")),
    ])
    .map(([tile, matrix]) => ({
      tile,
      matrix,
      ...getSides(matrix),
      neighbors: {
        top: null,
        bottom: null,
        left: null,
        right: null,
      },
    }));

const orientTile = ({ tile, from, to, side }) => {
  const rotation = getRotation({ from, to });
  rotateTile(tile, rotation);

  if (!arrayEquals({ left: tile[getSide(to)], right: side })) {
    const orientation = getDirection(to);
    const direction = orientation === "vertical" ? "horizontal" : "vertical";
    flipTile(tile, direction);
  }
};

const findAndOrientNeighbor = ({ side, sideIndex, tiles }) => {
  for (const tile of tiles) {
    for (const [i, s] of sides.entries()) {
      const currentSide = tile[s];
      const oppositeSideIndex = (sideIndex + 2) % 4;

      if (
        arrayEquals({ left: side, right: currentSide }) ||
        arrayEquals({ left: side, right: reverse(currentSide) })
      ) {
        orientTile({ tile, from: i, to: oppositeSideIndex, side });
        return tile;
      }
    }
  }

  return null;
};

const positionTiles = ([tile, ...tiles], accumulator) => {
  let acc = accumulator || new Map();
  let neighbors = [],
    others = [...tiles];

  if (acc.has(tile.tile)) {
    return acc;
  }

  for (const [index, side] of sides.entries()) {
    const neighbor = findAndOrientNeighbor({
      side: tile[side],
      sideIndex: index,
      tiles: others,
    });

    if (neighbor) {
      tile.neighbors[side] = neighbor.tile;
      const oppositeSide = sides[(index + 2) % 4];
      neighbor.neighbors[oppositeSide] = tile.tile;

      neighbors.push(neighbor);
      const neighborIndex = others.findIndex((n) => n.tile === neighbor.tile);
      others.splice(neighborIndex, 1);
    }
  }

  acc.set(tile.tile, tile);
  neighbors.forEach((neighbor) => positionTiles([neighbor, ...others], acc));

  return acc;
};

const createCanvas = (tilesMap) => {
  const canvas = [];
  let currentTile = [...tilesMap.values()].find(
    ({ neighbors }) => neighbors.top === null && neighbors.left === null
  );

  while (currentTile) {
    const row = [currentTile];
    let rowStart = currentTile;

    while (currentTile.neighbors.right) {
      currentTile = tilesMap.get(currentTile.neighbors.right);
      row.push(currentTile);
    }
    currentTile = tilesMap.get(rowStart.neighbors.bottom);
    canvas.push(row);
  }

  return canvas;
};

const printMatrix = ({ matrix, trimBorders = 0 }) => {
  let rows = [];
  for (let x = trimBorders, xMax = matrix.length - trimBorders; x < xMax; x++) {
    let row = "";
    for (
      let y = trimBorders, yMax = matrix[0].length - trimBorders;
      y < yMax;
      y++
    ) {
      row += toChar(matrix[x][y]);
    }
    rows.push(row);
  }

  return rows;
};

const printCanvas = ({ canvas, trimBorders = 0 }) =>
  canvas.flatMap((row) =>
    row
      .map((tile) => printMatrix({ matrix: tile.matrix, trimBorders }))
      .reduce((left, right) =>
        left.map((row, index) => `${row}${right[index]}`)
      )
  );

const isAtPosition = ({ x, y, grid, pattern }) => {
  for (const [px, py] of pattern) {
    if (!grid[x + px][y + py]) {
      return false;
    }
  }

  return true;
};

const findPatternOccurences = ({
  pattern,
  grid,
  rotations: [current, ...rotations],
}) => {
  const maxXdelta = pattern.reduce(
    (max, [x]) => (max > x ? max : x),
    Number.MIN_SAFE_INTEGER
  );
  const maxYdelta = pattern.reduce(
    (max, [_, y]) => (max > y ? max : y),
    Number.MIN_SAFE_INTEGER
  );

  if (!current) {
    console.log("Exhausted all rotations");
    return 0;
  }
  const matrix = current(grid);
  let occurences = 0;
  for (let y = 0, yMax = grid.length - maxYdelta; y < yMax; y++) {
    for (let x = 0, xMax = grid[0].length - maxXdelta; x < xMax; x++) {
      if (isAtPosition({ x, y, grid, pattern })) {
        occurences++;
      }
    }
  }

  return occurences > 0
    ? occurences
    : findPatternOccurences({ pattern, grid: matrix, rotations });
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const rawTiles = await readFile(input);

  const tiles = readTiles(rawTiles);
  const tilesMap = positionTiles(tiles);
  const canvas = createCanvas(tilesMap);
  let corners = canvas.reduce(
    (acc, row) => [
      ...acc,
      ...row.filter(
        (tile) => Object.values(tile.neighbors).filter((n) => n).length === 2
      ),
    ],
    []
  );

  const product = corners
    .map(({ tile }) => tile)
    .filter((t, i, a) => a.indexOf(t) === i)
    .reduce((result, tile) => result * parseInt(tile), 1);

  const canvasTiles = canvas.map((row) => row.map((tile) => tile.tile));

  const printWithoutBorders = printCanvas({ canvas, trimBorders: 1 });
  const monster = [
    "                  # ",
    "#    ##    ##    ###",
    " #  #  #  #  #  #   ",
  ]
    .flatMap((row, y) => row.split("").map((c, x) => [c, x, y]))
    .filter(([c]) => c === "#")
    .map(([_, x, y]) => [x, y]);

  const grid = printWithoutBorders.map((row) =>
    row.split("").map((c) => c === "#")
  );
  const occurences = findPatternOccurences({
    pattern: monster,
    grid,
    rotations: [
      (matrix) => matrix,
      rotateMatrix90,
      rotateMatrix90,
      rotateMatrix90,
      flipMatrix,
      rotateMatrix90,
      rotateMatrix90,
      rotateMatrix90,
    ],
  });

  const activeBlocks = grid.reduce(
    (acc, row) => acc + row.filter((v) => v).length,
    0
  );
  const remainingBlocks = activeBlocks - monster.length * occurences;
  console.log({
    canvas,
    canvasTiles,
    corners,
    product,
    monster,
    occurences,
    activeBlocks,
    remainingBlocks,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
