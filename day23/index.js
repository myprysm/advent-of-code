const readCups = (cups) => cups.split("").map((v) => parseInt(v));

const generateNumbers = ({ from, to }) => {
  const array = [];
  for (let i = from; i <= to; i++) {
    array.push(i);
  }

  return array;
};

const findMin = (array) =>
  array.reduce(
    (min, value) => (min < value ? min : value),
    Number.MAX_SAFE_INTEGER
  );
const findMax = (array) =>
  array.reduce(
    (max, value) => (max > value ? max : value),
    Number.MIN_SAFE_INTEGER
  );

class Cup {
  constructor(value) {
    this.value = value;
    this.left = this;
    this.right = this;
  }

  toString() {
    return this.value;
  }
}

const createCup = (value, head) => {
  const cup = new Cup(value);

  cup.right = head;
  cup.left = head.left.right;
  head.left.right = cup;
  head.left = cup;

  return cup;
};

const printResult = (cup) => {
  let currentCup = cup,
    result = "";

  while (currentCup.right !== cup) {
    result += currentCup.right.value;
    currentCup = currentCup.right;
  }

  return result;
};

const playGame = ({ cups, moves, withResult }) => {
  const gamingCups = new Array(cups.length + 1);
  const min = findMin(cups);
  const max = findMax(cups);
  const head = new Cup(cups[0]);
  gamingCups[head.value] = head;

  for (let i = 1; i < cups.length; i++) {
    const cup = cups[i];
    gamingCups[cup] = createCup(cup, head);
  }

  let currentCup = head;
  for (let i = 1; i <= moves; i++) {
    const firstPick = currentCup.right;
    currentCup.right = currentCup.right.right.right.right;

    let destination;
    let value = currentCup.value;
    while (!destination) {
      value--;
      if (value < min) {
        value = max;
      }

      if (
        value !== firstPick.value &&
        value !== firstPick.right.value &&
        value !== firstPick.right.right.value
      ) {
        destination = gamingCups[value];
      }
    }

    firstPick.right.right.right = destination.right;
    destination.right = firstPick;

    currentCup = currentCup.right;
  }

  const one = gamingCups[1];
  const result = withResult ? printResult(one) : "";
  const firstStar = one.right.value;
  const secondStar = one.right.right.value;
  return {
    current: currentCup.value,
    result,
    firstStar,
    secondStar,
    startProduct: firstStar * secondStar,
  };
};

const part1 = (sampleCups, cups) => {
  const sample1 = playGame({ cups: sampleCups, moves: 10, withResult: true });
  const sample2 = playGame({ cups: sampleCups, moves: 100, withResult: true });
  const game = playGame({ cups, moves: 100, withResult: true });

  console.log({ sample1, sample2, game });
};

const part2 = (startingCups) => {
  const from = findMax(startingCups) + 1;
  const to = 1_000_000;
  console.log("Generating numbers");
  const otherCups = generateNumbers({ from, to });
  const cups = [...startingCups, ...otherCups];
  console.log("Start game");
  const game = playGame({ cups, moves: 10_000_000 });

  console.log(game);
};

async function main() {
  const sampleCups = readCups(`389125467`);
  const cups = readCups(`963275481`);
  part1(sampleCups, cups);
  part2(cups);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
