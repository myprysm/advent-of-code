const playMemoryGame = ({ numbers, turns }) => {
  const registry = new Map();
  numbers.forEach((number, turn) => registry.set(number, turn));

  let lastNumberSpoken = numbers[numbers.length - 1];
  for (let turn = numbers.length; turn < turns; turn++) {
    let thisNumber = 0;

    if (registry.has(lastNumberSpoken)) {
      thisNumber = turn - 1 - registry.get(lastNumberSpoken);
    }

    registry.set(lastNumberSpoken, turn - 1);
    lastNumberSpoken = thisNumber;
  }

  return lastNumberSpoken;
};

async function main() {
  // const turns = 2020;
  const turns = 30000000;
  const series = [
    [0, 3, 6],
    [1, 3, 2],
    [2, 1, 3],
    [1, 2, 3],
    [2, 3, 1],
    [3, 2, 1],
    [3, 1, 2],
    [1, 0, 18, 10, 19, 6],
  ];

  series.forEach((numbers) => {
    const start = process.hrtime();
    console.log({
      numbers,
      [turns]: playMemoryGame({ numbers, turns }),
      duration: process.hrtime(start),
    });
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
