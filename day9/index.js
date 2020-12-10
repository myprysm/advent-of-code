const readLines = require("../utils/readLines");

const prepareNumbers = ({ numbers, preambleSize }) => [
  numbers.slice(0, preambleSize),
  numbers.slice(preambleSize),
];

const isValid = ({ preamble, datum }) => {
  for (let i = 0, iMax = preamble.length - 1; i < iMax; i++) {
    for (let j = 1, jMax = preamble.length; j < jMax; j++) {
      if (preamble[i] + preamble[j] === datum) {
        return true;
      }
    }
  }
};

const findInvalidNumber = ({ preamble, data }) => {
  const preambleCopy = [...preamble];

  for (const datum of data) {
    if (isValid({ preamble: preambleCopy, datum })) {
      preambleCopy.shift();
      preambleCopy.push(datum);
    } else {
      return datum;
    }
  }
};

const findEncryptionWeakness = ({ numbers, invalidNumber }) => {
  for (let i = 0, iMax = numbers.length - 1; i < iMax; i++) {
    let sum = numbers[i];
    for (let j = i + 1, jMax = numbers.length; j < jMax; j++) {
      sum += numbers[j];
      if (sum > invalidNumber) {
        break;
      } else if (sum === invalidNumber) {
        const range = numbers.slice(i, j + 1);
        const min = range.reduce(
          (acc, n) => (acc < n ? acc : n),
          Number.MAX_SAFE_INTEGER
        );
        const max = range.reduce(
          (acc, n) => (acc > n ? acc : n),
          Number.MIN_SAFE_INTEGER
        );

        return min + max;
      }
    }
  }

  throw new Error("Found no weakness");
};

async function main() {
  const numbers = (await readLines(`${__dirname}/inputs.txt`)).map((n) =>
    parseInt(n)
  );

  const [preamble, data] = prepareNumbers({ numbers, preambleSize: 25 });
  const invalidNumber = findInvalidNumber({ preamble, data });
  const weakness = findEncryptionWeakness({ numbers, invalidNumber });

  console.log({ preamble, data, invalidNumber, weakness });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
