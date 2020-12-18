const readLines = require("../utils/readLines");

const countActiveCubes = (cube) => [...cube.values()].filter((v) => v).length;
const writePosition = (coordinates) => coordinates.join(",");
const readPosition = (position) => position.split(",").map((p) => parseInt(p));

const toRange = (coordinates) => coordinates.map((c) => [c - 1, c, c + 1]);

const countNeighborsRecursiveRange = ({ cube, ranges, combinations = [] }) => {
  // Tail
  if (!ranges.length) {
    let count = 0;
    for (const coordinates of combinations) {
      const position = writePosition(coordinates);

      if (cube.has(position) && cube.get(position)) {
        count++;
      }
    }

    return count;
  }

  const [range, ...rest] = ranges;

  // Head
  if (!combinations.length) {
    let count = 0;
    for (const item of range) {
      count += countNeighborsRecursiveRange({
        cube,
        ranges: rest,
        combinations: [[item]],
      });
    }

    return count;
  }

  let count = 0;
  for (const combination of combinations) {
    for (const item of range) {
      const subCombinations = [...combination, item];
      count += countNeighborsRecursiveRange({
        cube,
        ranges: rest,
        combinations: [subCombinations],
      });
    }
  }

  return count;
};

const countNeighbors = ({ cube, coordinates }) => {
  const neighborCoordinates = getNeighborCoordinates(coordinates);

  let neighbors = 0;

  for (const neighbor of neighborCoordinates) {
    const position = writePosition(neighbor);

    if (cube.has(position) && cube.get(position)) {
      neighbors++;

      if (neighbors >= 4) {
        return neighbors;
      }
    }
  }

  return neighbors;
};

const equalCoordinates = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }

  for (let i = 0, max = left.length; i < max; i++) {
    if (left[i] !== right[i]) {
      return false;
    }
  }

  return true;
};

const getAllCoordinatesAround = (coordinates) => {
  const [first, ...ranges] = toRange(coordinates);
  return ranges.reduce(
    (comb, range) => comb.flatMap((c) => range.map((r) => [...c, r])),
    first.map((c) => [c])
  );
};

const getNeighborCoordinates = (coordinates) =>
  getAllCoordinatesAround(coordinates).filter(
    (c) => !equalCoordinates(c, coordinates)
  );

const playCycle = ({ cube }) => {
  let workingCube = new Map(cube);
  const activeCoordinates = [...cube.entries()]
    .filter(([_, value]) => value)
    .map(([p]) => readPosition(p));

  const consideredCoordinates = [];
  for (const coordinates of activeCoordinates) {
    const neighbors = getAllCoordinatesAround(coordinates);
    for (const neighbor of neighbors) {
      if (consideredCoordinates.every((c) => !equalCoordinates(c, neighbor))) {
        consideredCoordinates.push(neighbor);
      }
    }
  }

  for (const coordinates of consideredCoordinates) {
    const position = writePosition(coordinates);
    const neighbors = countNeighbors({ cube, coordinates });
    if (!workingCube.has(position) || !workingCube.get(position)) {
      if (neighbors === 3) {
        workingCube.set(position, true);
      } else if (workingCube.has(position)) {
        workingCube.delete(position);
      }
      continue;
    }

    if (neighbors === 2 || neighbors === 3) {
      workingCube.set(position, true);
    } else {
      workingCube.delete(position);
    }
  }

  return workingCube;
};

const playCycles = ({ cube, cycles }) => {
  let workingCube = new Map(cube);
  for (let cycle = 0; cycle < cycles; cycle++) {
    console.log({ cycle });
    workingCube = playCycle({ cube: workingCube });
  }

  return workingCube;
};

async function main() {
  const input = `${__dirname}/inputs.txt`;
  const initialState = (await readLines(input)).map((l) =>
    l.split("").map((c) => c === "#")
  );
  const cycles = 6;

  const initialCoordinates = initialState.flatMap((row, y) =>
    row.map((cell, x) => [writePosition([0, 0, y, x]), cell])
  );
  const initialCube = new Map(initialCoordinates);
  const finalCube = playCycles({ cube: initialCube, cycles });
  console.log({
    activeSources: countActiveCubes(finalCube),
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
