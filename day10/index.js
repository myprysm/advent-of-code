const readLines = require("../utils/readLines");

const findAdapterChain = (adapters) =>
  adapters
    .sort((a, b) => a - b)
    .filter((a, index) =>
      index === adapters.length - 1
        ? a - adapters[index - 1] < 4
        : adapters[index + 1] - a < 4
    );

const findJoltageDifferences = (adapters) =>
  adapters.reduce(
    ([one, two, three], adapter, index, chain) => {
      const difference = chain[index + 1] - adapter;

      if (difference === 1) {
        return [one + 1, two, three];
      } else if (difference === 2) {
        return [one, two + 1, three];
      } else if (difference === 3) {
        return [one, two, three + 1];
      }

      return [one, two, three];
    },
    [0, 0, 0]
  );

const findNumberOfPermutations = (adapters) => {
  const [totalPermutations] = adapters
    .map((a, index) => [
      index,
      // An adapter can be removed in the middle if the distance between the previous and the next is less than 3
      0 < index &&
        index < adapters.length - 1 &&
        a - adapters[index - 1] < 3 &&
        adapters[index + 1] - a < 3,
    ])
    .filter(([_, canRemove]) => canRemove)
    .reduce(
      ([totalPermutations, currentPermutations], [index], i, permutations) => {
        const newPermutation = currentPermutations * 2;

        // There will never be more than 3 permutations in a row
        if (newPermutation === 8) {
          return [totalPermutations * 7, 1];
        }

        if (
          i === permutations.length - 1 ||
          permutations[i + 1][0] - index > 1
        ) {
          return [totalPermutations * newPermutation, 1];
        }

        return [totalPermutations, newPermutation];
      },
      [1, 1]
    );

  return totalPermutations;
};

async function main() {
  const adapters = (await readLines(`${__dirname}/inputs.txt`)).map((n) =>
    parseInt(n)
  );

  const adapterChain = findAdapterChain([0, ...adapters]);
  const deviceJoltage = adapterChain[adapterChain.length - 1] + 3;
  const chain = [...adapterChain, deviceJoltage];
  const [one, two, three] = findJoltageDifferences(chain);
  const permutations = findNumberOfPermutations(chain);
  console.log({ permutations, one, two, three, oneTimesThree: one * three });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`An error occurred: ${err.message}`, err);
  });
