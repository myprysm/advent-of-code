const readLines = require("../utils/readLines");

const countTrees = ({ matrix, x, y }) => {
  let i = y,
    j = 0,
    trees = 0,
    rows = matrix.length,
    cells = matrix[0].length;

  for (; i < rows; i += y) {
    j = (j + x) % cells;

    if (matrix[i][j] === "#") {
      trees += 1;
    }
  }

  return trees;
};

async function main() {
  const matrix = await readLines(`${__dirname}/inputs.txt`);

  const vectors = [
    [1, 1],
    [3, 1],
    [5, 1],
    [7, 1],
    [1, 2],
  ];

  const trees = vectors.reduce(
    (product, [x, y]) => product * countTrees({ matrix, x, y }),
    1
  );
  console.log(trees);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
